import { ItemView, WorkspaceLeaf } from "obsidian";
import { FormDefinition } from "src/core/formDefinition";
import { formsStore, invalidFormsStore, settingsStore } from "src/store/SettngsStore";
import { log_notice, notifyError } from "src/utils/Log";
import ModalFormPlugin from "../main";
import ManageForms from "./ManageForms.svelte";

export const MANAGE_FORMS_VIEW = "modal-form-manage-forms-view";

/**
 * Manage existing forms and create new ones
 */
export class ManageFormsView extends ItemView {
    component!: ManageForms;
    constructor(
        readonly leaf: WorkspaceLeaf,
        readonly plugin: ModalFormPlugin,
    ) {
        super(leaf);
        this.icon = "documents";
    }

    getViewType() {
        return MANAGE_FORMS_VIEW;
    }

    getDisplayText() {
        return "Manage forms";
    }

    async onOpen() {
        // console.log('On open manage forms');
        const container = this.containerEl.children[1] || this.containerEl.createDiv();
        container.empty();

        this.component = new ManageForms({
            target: container,
            props: {
                forms: formsStore,
                invalidForms: invalidFormsStore,
                createNewForm: () => {
                    this.plugin.createNewForm();
                },
                editForm: (formName: string) => {
                    this.plugin.editForm(formName);
                },
                deleteForm: (formName: string) => {
                    settingsStore.removeForm(formName);
                },
                duplicateForm: (formName: string) => {
                    settingsStore.duplicateForm(formName);
                },
                copyFormToClipboard: async (form: FormDefinition) => {
                    await navigator.clipboard.writeText(JSON.stringify(form, null, 2));
                    log_notice("Copied!", "Form has been copied to the clipboard");
                },
                openImportFormModal: () => {
                    this.plugin.openImportFormModal();
                },
                openInTemplateBuilder: (formDefinition: FormDefinition) => {
                    this.plugin.openTemplateBuilder({ formDefinition });
                },
                previewForm: async (form: FormDefinition) => {
                    try {
                        const result = await this.plugin.api.openForm(form);
                        const result_str = JSON.stringify(result, null, 2);
                        log_notice("Form result", result_str);
                    } catch (error) {
                        notifyError("Failed to preview form")(String(error));
                        log_notice(
                            `Preview failed: `,
                            `${error instanceof Error ? error.message : "Unknown error"}`,
                        );
                    }
                },
            },
        });
    }

    async onClose() {
        this.component.$destroy();
    }
}
