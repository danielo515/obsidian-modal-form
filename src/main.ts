import { Platform, Plugin, WorkspaceLeaf } from "obsidian";
import FormResult from "src/core/FormResult";
import { exampleModalDefinition } from "src/exampleModalDefinition";
import { ModalFormSettingTab } from "src/ModalFormSettingTab";
import { API } from "src/API";
import { EDIT_FORM_VIEW, EditFormView } from "src/views/EditFormView";
import { MANAGE_FORMS_VIEW, ManageFormsView } from "src/views/ManageFormsView";
import { ModalFormError } from "src/utils/ModalFormError";
import { FormWithTemplate, type FormDefinition } from "src/core/formDefinition";
import {
    formNeedsMigration,
    migrateToLatest,
    MigrationError,
    InvalidData,
} from "./core/formDefinitionSchema";
import {
    parseSettings,
    type ModalFormSettings,
    type OpenPosition,
    getDefaultSettings,
} from "src/core/settings";
import { log_error, log_notice } from "./utils/Log";
import { settingsStore } from "./store/store";
import { O, pipe, E, A } from "@std";
import { executeTemplate } from "./core/template/templateParser";
import { NewNoteModal } from "./suggesters/NewNoteModal";
import { file_exists } from "./utils/files";
import { FormPickerModal } from "./suggesters/FormPickerModal";
import { FormImportModal } from "./views/FormImportView";

type ViewType = typeof EDIT_FORM_VIEW | typeof MANAGE_FORMS_VIEW;

// Define functions and properties you want to make available to other plugins, or templater templates, etc
export interface PublicAPI {
    exampleForm(): Promise<FormResult>;
    openForm(formReference: string | FormDefinition): Promise<FormResult>;
}

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
    public api!: PublicAPI;

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
            leaf = this.app.workspace.getRightLeaf(false);
        } else if (this.settings?.editorPosition === "left") {
            leaf = this.app.workspace.getLeftLeaf(false);
        } else if (this.settings?.editorPosition === "modal") {
            leaf = this.app.workspace.getLeaf(false);
        } else {
            leaf = this.app.workspace.getRightLeaf(false);
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

    async onload() {
        const settings = await this.getSettings();
        if (settings.formDefinitions.length === 0) {
            settings.formDefinitions.push(exampleModalDefinition);
        }
        settingsStore.set(settings);
        this.unsubscribeSettingsStore = settingsStore.subscribe((s) => {
            console.log("settings changed", s);
            this.settings = s;
            this.saveSettings(s);
        });
        this.api = new API(this.app, this);
        this.attachShortcutToGlobalWindow();
        this.registerView(EDIT_FORM_VIEW, (leaf) => new EditFormView(leaf, this));
        this.registerView(MANAGE_FORMS_VIEW, (leaf) => new ManageFormsView(leaf, this));

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

    /**
     * Checks if there are forms with templates, and presents a prompt
     * to select a form, then opens the forms, and creates a new note
     * with the template and the form values
     */
    createNoteFromForm() {
        const formsWithTemplates = pipe(
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
        const onFormSelected = async (
            form: FormWithTemplate,
            noteName: string,
            destinationFolder: string,
        ) => {
            const formData = await this.api.openForm(form);
            const newNoteFullPath = this.getUniqueNoteName(noteName, destinationFolder);
            const noteContent = executeTemplate(form.template.parsedTemplate, formData.getData());
            console.log("new note content", noteContent);
            this.app.vault.create(newNoteFullPath, noteContent);
        };
        const picker = new NewNoteModal(
            this.app,
            formsWithTemplates,
            ({ form, folder, noteName }) => {
                onFormSelected(form, noteName, folder);
            },
        );
        picker.open();
    }
}
