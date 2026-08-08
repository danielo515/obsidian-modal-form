import { A, E, O, pipe } from "@std";
import {
    Editor,
    MarkdownFileInfo,
    MarkdownView,
    Platform,
    Plugin,
    WorkspaceLeaf,
} from "obsidian";
import { API } from "src/API";
import { ModalFormSettingTab } from "src/ModalFormSettingTab";
import { FormWithTemplate, type FormDefinition } from "src/core/formDefinition";
import {
    getDefaultSettings,
    parseSettings,
    type ModalFormSettings,
    type OpenPosition,
} from "src/core/settings";
import { exampleModalDefinition } from "src/exampleModalDefinition";
import { ModalFormError } from "src/utils/ModalFormError";
import { EDIT_FORM_VIEW, EditFormView } from "src/views/EditFormView";
import { MANAGE_FORMS_VIEW, ManageFormsView } from "src/views/ManageFormsView";
import {
    formNeedsMigration,
    InvalidData,
    migrateToLatest,
    MigrationError,
} from "./core/formDefinitionSchema";
import {
    DRAFTS_STORAGE_KEY,
    makeFormDraftStore,
    makeNoopDraftStore,
    type FormDraft,
    type FormDraftStore,
} from "./core/formDrafts";
import type { ModalFormData } from "./core/formResultTypes";
import { TemplateService } from "./core/template/TemplateService";
import { getTemplateService } from "./core/template/getTemplateService";
import { describeTemplateError, renderTemplate } from "./core/template/renderTemplate";
import { retryForm } from "./core/template/retryForm";
import { settingsStore } from "./store/SettngsStore";
import { DraftPickerModal } from "./suggesters/DraftPickerModal";
import { FormPickerModal } from "./suggesters/FormPickerModal";
import { NewNoteModal } from "./suggesters/NewNoteModal";
import { appLocalStorage } from "./utils/appLocalStorage";
import { log_error, log_notice, notifyError, notifyWarning } from "./utils/Log";
import { logger } from "./utils/Logger";
import { file_exists } from "./utils/files";
import { FormImportModal } from "./views/FormImportView";
import { TemplateBuilderModal } from "./views/TemplateBuilderModal";
import { TEMPLATE_BUILDER_VIEW, TemplateBuilderView } from "./views/TemplateBuilderView";
import { askTemplateFailure } from "./views/TemplateFailureModal";
import { makeModel } from "./views/components/TemplateBuilder";

type ViewType = typeof EDIT_FORM_VIEW | typeof MANAGE_FORMS_VIEW | typeof TEMPLATE_BUILDER_VIEW;

function notifyParsingErrors(errors: InvalidData[]) {
    if (errors.length === 0) {
        return;
    }
    log_notice(
        "⚠️ Some forms could not be parsed ⚠️",
        `We found some invalid data while parsing the form settings, please take a look at the following errors: 
            ${errors.join("\n")}`,
    );
}

function notifyMigrationErrors(errors: MigrationError[]) {
    if (errors.length === 0) {
        return;
    }
    log_notice(
        "Some forms could not be migrated",
        `We tried to perform an automatic migration, but we failed. Go to the forms manager and fix the following forms:
            ${errors.map((e) => e.name).join("\n")}`,
    );
}
// This is the plugin entrypoint
export default class ModalFormPlugin extends Plugin {
    public settings: ModalFormSettings | undefined;
    private unsubscribeSettingsStore: () => void = () => {};
    // This things will be setup in the onload function rather than constructor
    public api!: API;
    /**
     * Keeps what the user typed while a form is open, so a crash, an accidental
     * close or a failing template never takes the data with it.
     */
    public drafts: FormDraftStore = makeNoopDraftStore();
    private templateService!: TemplateService;

    manageForms() {
        return this.activateView(MANAGE_FORMS_VIEW);
    }

    createNewForm() {
        return this.activateView(EDIT_FORM_VIEW);
    }

    /**
     * Opens the form in the editor.
     * @returns
     */
    async editForm(formName: string) {
        // By reading settings from the disk we get a copy of the form
        // effectively preventing any unexpected side effects to the running configuration
        // For example, mutating a form, cancelling the edit but the form is already mutated,
        // then if you save another form you will unexpectedly save the mutated form too.
        // Maybe we could instead do a deep copy instead, but until this proven to be a bottleneck I will leave it like this.
        const savedSettings = await this.getSettings();
        const formDefinition = savedSettings.formDefinitions.find((form) => form.name === formName);
        if (!formDefinition) {
            throw new ModalFormError(`Form ${formName} not found`);
        }
        if (formDefinition instanceof MigrationError) {
            notifyMigrationErrors([formDefinition]);
            return;
        }
        await this.activateView(EDIT_FORM_VIEW, formDefinition);
    }

    openImportFormModal() {
        const importModal = new FormImportModal(this.app, {
            createForm: (form) => {
                importModal.close();
                this.activateView(EDIT_FORM_VIEW, form);
            },
        });
        importModal.open();
    }

    openTemplateBuilder({
        // We need the state to be serializable for the view, so we can't get the model directly
        formDefinition,
        openOnModal = false,
    }: {
        formDefinition: FormDefinition;
        openOnModal?: boolean;
    }) {
        if (openOnModal) {
            new TemplateBuilderModal(this.app, makeModel(formDefinition)).open();
        } else {
            this.activateView(TEMPLATE_BUILDER_VIEW, formDefinition);
        }
    }

    closeEditForm() {
        this.app.workspace.detachLeavesOfType(EDIT_FORM_VIEW);
    }

    onunload() {
        this.unsubscribeSettingsStore();
    }

    async activateView(viewType: ViewType, state?: FormDefinition) {
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | undefined = workspace.getLeavesOfType(viewType)[0];
        if (leaf) {
            console.info("found leaf, no reason to create a new one");
        } else if (Platform.isMobile || this.settings?.editorPosition === "mainView") {
            leaf = this.app.workspace.getLeaf("tab");
        } else if (this.settings?.editorPosition === "right") {
            leaf = this.app.workspace.getRightLeaf(false) ?? undefined;
        } else if (this.settings?.editorPosition === "left") {
            leaf = this.app.workspace.getLeftLeaf(false) ?? undefined;
        } else if (this.settings?.editorPosition === "modal") {
            leaf = this.app.workspace.getLeaf(false);
        } else {
            leaf = this.app.workspace.getRightLeaf(false) ?? undefined;
        }

        if (!leaf) {
            leaf = this.app.workspace.getLeaf("tab");
        }

        await leaf.setViewState({
            type: viewType,
            active: true,
            state,
        });
        this.app.workspace.revealLeaf(leaf);
        return leaf;
    }

    // TODO: extract the migration logic to a separate function and test it
    // TODO: collect actual migration events to decide if we need to migrate or not rather than this naive approach
    async getSettings(): Promise<ModalFormSettings> {
        const data = await this.loadData();
        const [migrationIsNeeded, settings] = pipe(
            parseSettings(data),
            E.map((settings): [boolean, ModalFormSettings] => {
                const migrationIsNeeded = settings.formDefinitions.some(formNeedsMigration);
                const { right: formDefinitions, left: errors } = A.partitionMap(migrateToLatest)(
                    settings.formDefinitions,
                );
                notifyParsingErrors(errors);
                const validSettings: ModalFormSettings = {
                    ...settings,
                    formDefinitions,
                };
                return [migrationIsNeeded, validSettings];
            }),
            E.getOrElse(() => [false, getDefaultSettings()]),
        );

        if (migrationIsNeeded) {
            await this.saveSettings(settings);
            console.info("Settings were migrated to the latest version");
        }
        return settings;
    }

    private async saveSettings(newSettings?: ModalFormSettings) {
        await this.saveData(newSettings || this.settings);
    }

    async setEditorPosition(position: OpenPosition) {
        this.settings!.editorPosition = position;
        await this.saveSettings();
    }

    attachShortcutToGlobalWindow() {
        if (!this.settings) {
            log_error(new ModalFormError("Settings not loaded yet"));
            return;
        }
        const globalNamespace = this.settings.globalNamespace;
        if (this.settings?.attachShortcutToGlobalWindow) {
            window[globalNamespace] = this.api;
        }
    }

    async setPreserveFormDrafts(value: boolean) {
        this.settings!.preserveFormDrafts = value;
        if (!value) {
            this.drafts.clearAll();
        }
        await this.saveSettings();
    }

    async setAttachShortcutToGlobalWindow(value: boolean) {
        this.settings!.attachShortcutToGlobalWindow = value;
        this.attachShortcutToGlobalWindow();
        await this.saveSettings();
    }

    get validFormDefinitions(): FormDefinition[] {
        return pipe(
            this.settings!.formDefinitions,
            A.filterMap((form) => (form instanceof MigrationError ? O.none : O.some(form))),
        );
    }

    /**
     * Register commands for forms with templates based on their command creation options
     * @returns Number of commands registered
     */
    registerTemplateCommands(): number {
        // Skip if no settings are available
        if (!this.settings) {
            logger.error("Cannot register template commands - settings not loaded");
            return 0;
        }

        const formsWithTemplates = this.getFormsWithTemplates();

        // Track how many commands were registered
        let commandsRegistered = 0;

        // Process each form with template
        formsWithTemplates.forEach((form) => {
            // Skip forms without template
            if (!form.template) return;

            // With withDefault in the schema, these values are guaranteed to be available
            const { createInsertCommand, createNoteCommand } = form.template;

            // Register insert template command if needed
            if (createInsertCommand) {
                this.addCommand({
                    id: `insert-template-${form.name}`,
                    name: `Insert template: ${form.name}`,
                    editorCallback: (editor, ctx) => {
                        this.runInsertTemplateFlow(form, editor, ctx);
                    },
                });
                commandsRegistered++;
            }

            // Register create note command if needed
            if (createNoteCommand) {
                this.addCommand({
                    id: `create-note-from-template-${form.name}`,
                    name: `Create note from template: ${form.name}`,
                    callback: () => {
                        const picker = new NewNoteModal(
                            this.app,
                            [form],
                            ({ form: selectedForm, folder, noteName }) => {
                                this.runCreateNoteFlow(selectedForm, noteName, folder);
                            },
                        );
                        picker.open();
                    },
                });
                commandsRegistered++;
            }
        });

        return commandsRegistered;
    }

    async onload() {
        const settings = await this.getSettings();
        if (settings.formDefinitions.length === 0) {
            settings.formDefinitions.push(exampleModalDefinition);
        }
        settingsStore.set(settings);
        this.unsubscribeSettingsStore = settingsStore.subscribe((s) => {
            console.log("settings changed", s);
            this.settings = s;
            // Register template commands when settings change
            this.registerTemplateCommands();
            this.saveSettings(s);
        });
        this.drafts = makeFormDraftStore(
            appLocalStorage(this.app, DRAFTS_STORAGE_KEY, logger),
            { isEnabled: () => this.settings?.preserveFormDrafts ?? true },
        );
        this.drafts.prune();
        this.api = new API(this.app, this);
        this.attachShortcutToGlobalWindow();
        this.templateService = getTemplateService(this.app, logger);

        // Register template commands at startup
        this.registerTemplateCommands();
        this.registerView(EDIT_FORM_VIEW, (leaf) => new EditFormView(leaf, this));
        this.registerView(MANAGE_FORMS_VIEW, (leaf) => new ManageFormsView(leaf, this));
        this.registerView(TEMPLATE_BUILDER_VIEW, (leaf) => new TemplateBuilderView(leaf, this));

        // This creates an icon in the left ribbon.
        this.addRibbonIcon("documents", "Edit forms", (evt: MouseEvent) => {
            this.manageForms();
        });

        this.addCommand({
            id: "new-form",
            name: "New form",
            callback: () => {
                this.createNewForm();
            },
        });
        this.addCommand({
            id: "manage-forms",
            name: "Manage forms",
            callback: () => {
                this.manageForms();
            },
        });
        this.addCommand({
            id: "create-note-from-form",
            name: "Create new note from a form",
            callback: () => {
                this.createNoteFromForm();
            },
        });

        this.addCommand({
            id: "insert-form-template",
            name: "Insert form template",
            editorCallback: (editor, ctx) => {
                const formsWithTemplates = this.getFormsWithTemplates();
                if (formsWithTemplates.length === 0) {
                    notifyWarning("No forms with templates found")(
                        `Make sure you have at least one form with a template`,
                    );
                    return;
                }
                const replaceWithForm = (form: FormWithTemplate) => {
                    this.runInsertTemplateFlow(form, editor, ctx);
                };
                if (formsWithTemplates.length === 1) {
                    const form = formsWithTemplates[0] as FormWithTemplate;
                    return replaceWithForm(form);
                }

                new FormPickerModal(this.app, formsWithTemplates, replaceWithForm).open();
            },
        });

        this.addCommand({
            id: "edit-form",
            name: "Edit form",
            callback: async () => {
                new FormPickerModal(this.app, this.validFormDefinitions, (formToEdit) => {
                    this.activateView(EDIT_FORM_VIEW, formToEdit);
                }).open();
            },
        });

        this.addCommand({
            id: "import-form",
            name: "Import form",
            callback: () => this.openImportFormModal,
        });

        this.addCommand({
            id: "recover-form-data",
            name: "Recover form data",
            callback: () => {
                this.recoverFormData();
            },
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new ModalFormSettingTab(this.app, this));
    }

    /**
     * Finds a unique name for a note, given a name.
     * It just adds a number at the end of the name if the name is already taken.
     * @param name the name of the note, without the extension
     * @returns a unique name for the note, full path including the extension
     */
    getUniqueNoteName(name: string, destinationFolder?: string): string {
        const defaultNotesFolder = this.app.fileManager.getNewFileParent("", "note.md");
        function makePath(name: string, folder?: string, suffix?: number) {
            return `${folder || defaultNotesFolder.path}/${name}${suffix ? "-" + suffix : ""}.md`;
        }
        let destinationPath = makePath(name, destinationFolder);
        let i = 1;
        while (file_exists(destinationPath, this.app)) {
            destinationPath = makePath(name, destinationFolder, i);
            i++;
        }
        return destinationPath;
    }

    getFormsWithTemplates() {
        return pipe(
            this.settings!.formDefinitions,
            A.filterMap((form) => {
                if (form instanceof MigrationError) {
                    return O.none;
                }
                if (form.template !== undefined) {
                    return O.some(form as FormWithTemplate);
                }
                return O.none;
            }),
        );
    }

    /**
     * Opens the retry form so the user can fix a template that could not be
     * processed. Returns the fixed template, or nothing if they gave up.
     */
    private async askForTemplateFix(
        errorMessage: string,
        templateContent: string,
    ): Promise<string | undefined> {
        const result = await this.api.openForm(retryForm, {
            values: { title: errorMessage, template: templateContent },
            // The retry form is a plumbing detail. Its content is a rendered
            // template, not user input, so it would only be noise in the
            // recovery list.
            preserveData: false,
        });
        if (result.status === "cancelled") return undefined;
        const template = result.get("template");
        if (typeof template !== "string") {
            notifyWarning("Failed while retrying")("Template is not a string");
            return undefined;
        }
        return template;
    }

    /**
     * Tells the user the data they entered is still around, and how to get it back.
     */
    private keepDataForLater(form: FormDefinition) {
        this.drafts.markPending(form.name);
        // Nothing was kept if the user turned drafts off, so promising a
        // recovery would be a lie.
        if (O.isNone(this.drafts.find(form.name))) return;
        log_notice(
            "💾 Your form data was kept",
            `Reopen "${form.title}" to continue where you left off, ` +
                'or use the "Recover form data" command.',
        );
    }

    /**
     * Fills a form, renders its template and creates a note out of it.
     * Every step that can fail reports what went wrong and gives the user the
     * chance to retry without typing everything again.
     */
    async runCreateNoteFlow(
        form: FormWithTemplate,
        noteName: string,
        destinationFolder: string,
    ): Promise<void> {
        let values: ModalFormData | undefined;
        // Set when the user chose to fix the rendered template by hand, in
        // which case we retry with it instead of asking for the data again.
        let fixedContent: string | undefined;
        for (;;) {
            let noteContent: string;
            if (fixedContent !== undefined) {
                noteContent = fixedContent;
                fixedContent = undefined;
            } else {
                const result = await this.api.openForm(form, values ? { values } : undefined);
                if (result.status === "cancelled") return;
                values = result.getData();
                const rendered = renderTemplate(form.template.parsedTemplate, values);
                if (E.isLeft(rendered)) {
                    logger.error(rendered.left);
                    const choice = await askTemplateFailure(this.app, {
                        title: `The template of "${form.title}" could not be rendered`,
                        message: describeTemplateError(rendered.left),
                    });
                    if (choice === "retry-form") continue;
                    this.keepDataForLater(form);
                    return;
                }
                noteContent = rendered.right;
            }
            const outcome = await this.templateService.createNoteFromTemplate(
                noteContent,
                destinationFolder,
                noteName,
                false, // don't open the new note
            )();
            if (E.isRight(outcome)) {
                this.drafts.clear(form.name);
                log_notice(
                    "Note created successfully",
                    `Note "${noteName}" created in ${destinationFolder}`,
                );
                return;
            }
            logger.error(outcome.left);
            const choice = await askTemplateFailure(this.app, {
                title: `The note "${noteName}" could not be created`,
                message: describeTemplateError(outcome.left),
                canEditTemplate: true,
            });
            if (choice === "discard") {
                this.keepDataForLater(form);
                return;
            }
            if (choice === "edit-template") {
                const fixed = await this.askForTemplateFix(
                    describeTemplateError(outcome.left),
                    noteContent,
                );
                if (fixed === undefined) {
                    this.keepDataForLater(form);
                    return;
                }
                fixedContent = fixed;
            }
            // "retry-form" falls through, reopening the form with the same values
        }
    }

    /**
     * Fills a form and inserts its rendered template at the cursor.
     * The text is already in the note by the time templater runs, so there is
     * nothing to retry here, but a failure must still be reported clearly.
     */
    async runInsertTemplateFlow(
        form: FormWithTemplate,
        editor: Editor,
        ctx: MarkdownView | MarkdownFileInfo,
    ): Promise<void> {
        const result = await this.api.openForm(form);
        if (result.status === "cancelled") return;
        const rendered = renderTemplate(form.template.parsedTemplate, result.getData());
        if (E.isLeft(rendered)) {
            logger.error(rendered.left);
            notifyError("The form template could not be rendered")(
                describeTemplateError(rendered.left),
            );
            this.keepDataForLater(form);
            return;
        }
        editor.replaceSelection(rendered.right);
        if (!(ctx instanceof MarkdownView)) {
            notifyWarning("Cannot save file, editor is not a markdown view")(
                "The template was inserted, but we could not ask templater to process it.",
            );
            return;
        }
        logger.debug("Saving file after inserting form template");
        await ctx.save();
        const file = ctx.file?.path;
        if (!file) {
            this.drafts.clear(form.name);
            return;
        }
        // This gives obsidian some time to process the frontmatter and other
        // things before asking templater to do its job
        const outcome = await new Promise<E.Either<Error, void>>((resolve) => {
            setImmediate(() => {
                this.templateService.replaceVariablesInFile(file)().then(resolve);
            });
        });
        if (E.isLeft(outcome)) {
            logger.error(outcome.left);
            notifyError("Templater could not process the inserted template")(
                `${describeTemplateError(outcome.left)}. The text was inserted in the note, ` +
                    "but the templater commands inside it were not executed.",
            );
            return;
        }
        this.drafts.clear(form.name);
    }

    /**
     * Checks if there are forms with templates, and presents a prompt
     * to select a form, then opens the forms, and creates a new note
     * with the template and the form values
     */
    createNoteFromForm() {
        const formsWithTemplates = this.getFormsWithTemplates();

        const picker = new NewNoteModal(
            this.app,
            formsWithTemplates,
            ({ form, folder, noteName }) => {
                this.runCreateNoteFlow(form, noteName, folder);
            },
        );
        picker.open();
    }

    /**
     * Reopens a form with data we kept from a previous, unfinished attempt.
     * If the form is gone, at least show the data so it can be copied out.
     */
    private recoverDraft(draft: FormDraft) {
        const form = this.validFormDefinitions.find((f) => f.name === draft.formName);
        if (!form) {
            log_notice(
                `The form "${draft.formTitle}" no longer exists`,
                `This is the data we had kept for it:\n${JSON.stringify(draft.data, null, 2)}`,
            );
            return;
        }
        this.api.openForm(form, { values: draft.data });
    }

    private recoverFormData() {
        const drafts = this.drafts.list();
        if (drafts.length === 0) {
            log_notice(
                "Nothing to recover",
                "We have no saved form data. Data is only kept when a form is closed " +
                    "without submitting, or when something fails after submitting it.",
            );
            return;
        }
        new DraftPickerModal(this.app, drafts, (draft) => this.recoverDraft(draft)).open();
    }
}
