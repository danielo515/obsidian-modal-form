import { ItemView, type ViewStateResult, WorkspaceLeaf } from "obsidian";
import { settingsStore } from "src/store/store";
import { log_notice } from "src/utils/Log";
import { createClassComponent } from "svelte/legacy";
import type { EditableFormDefinition, FormDefinition } from "../core/formDefinition";
import ModalFormPlugin from "../main";
import FormEditor from "./FormBuilder.svelte";

export const EDIT_FORM_VIEW = "modal-form-edit-form-view";

function parseState(maybeState: unknown): maybeState is EditableFormDefinition {
    if (maybeState === null) {
        return false;
    }
    if (typeof maybeState !== "object") {
        return false;
    }
    if ("title" in maybeState && "name" in maybeState && "fields" in maybeState) {
        return true;
    }
    return false;
}

/**
 * Edits the form definition.
 * To create a new form, you just edit an empty form definition.
 * Simple, right?
 */
export class EditFormView extends ItemView {
    formState: EditableFormDefinition = { title: "", name: "", version: "1", fields: [] };
    originalFormName?: string;
    formEditor!: FormEditor;
    constructor(
        readonly leaf: WorkspaceLeaf,
        readonly plugin: ModalFormPlugin,
    ) {
        super(leaf);
        this.icon = "note-glyph";
    }

    getViewType() {
        return EDIT_FORM_VIEW;
    }

    getDisplayText() {
        return "Edit form";
    }

    async onOpen() {
        this.containerEl.empty();
        this.formEditor = createClassComponent({
            component: FormEditor,
            target: this.containerEl,
            props: {
                definition: this.formState,
                app: this.app,
                onChange: () => {
                    console.log("Save form state", this.formState);
                    this.app.workspace.requestSaveLayout();
                },
                onSubmit: (formDefinition: FormDefinition) => {
                    console.log("Submitting form", { formDefinition });
                    if (this.originalFormName && this.originalFormName !== "") {
                        settingsStore.updateForm(this.originalFormName, formDefinition);
                    } else {
                        settingsStore.addNewForm(formDefinition);
                    }
                    this.plugin.closeEditForm();
                },
                onCancel: () => {
                    this.plugin.closeEditForm();
                },
                onPreview: async (formDefinition: FormDefinition) => {
                    const result = await this.plugin.api.openForm(formDefinition);
                    const result_str = JSON.stringify(result, null, 2);
                    log_notice("Form result", result_str);
                    console.log(result_str);
                },
            },
        });
    }

    async onClose() {
        console.log("onClose of edit form called");
        this.formEditor.$destroy();
    }

    async setState(state: unknown, result: ViewStateResult): Promise<void> {
        console.log("setState of edit form called", state);
        if (parseState(state)) {
            this.formState = state;
            this.originalFormName = state.name;
            this.formEditor.$set({ definition: this.formState });
        }
        return super.setState(state, result);
    }
    getState() {
        return this.formState;
    }
}
