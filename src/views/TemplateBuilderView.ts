import { ItemView, ViewStateResult, WorkspaceLeaf } from "obsidian";
import { FormDefinition } from "src/core/formDefinition";
import ModalFormPlugin from "src/main";
import { makeModel } from "./components/TemplateBuilder";
import TemplateBuilder from "./components/TemplateBuilder.svelte";

export const TEMPLATE_BUILDER_VIEW = "modal-form-template-builder-view";
/**
 * This class is just the minimum glue code to bind our core logic
 * with the  svelte UI and obsidian API modal.
 */
export class TemplateBuilderView extends ItemView {
    model: FormDefinition | undefined;
    getViewType(): string {
        return TEMPLATE_BUILDER_VIEW;
    }
    getDisplayText(): string {
        return "Template Builder";
    }
    _component: TemplateBuilder | undefined;

    constructor(
        readonly leaf: WorkspaceLeaf,
        readonly plugin: ModalFormPlugin,
    ) {
        super(leaf);
    }

    async onClose() {
        this._component?.$destroy();
    }

    async onOpen() {
        const { contentEl } = this;
        if (!this.model) {
            console.log("No model found");
            return;
        }
        contentEl.empty();
        this._component = new TemplateBuilder({
            target: contentEl,
            props: { model: makeModel(this.model) },
        });
    }
    getState() {
        return this.model;
    }
    async setState(state: FormDefinition, result: ViewStateResult): Promise<void> {
        console.log("Setting state", state);
        this.model = state;
        this.app.workspace.trigger("view-state-change", result);
        await this.onOpen();
    }
}
