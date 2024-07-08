import { App, Modal } from "obsidian";
import { createClassComponent } from "svelte/legacy";
import { TemplateBuilderModel } from "./components/TemplateBuilder";
import TemplateBuilder from "./components/TemplateBuilder.svelte";
import { copyToClipboard } from "./copyToClipboard";
/**
 * This class is just the minimum glue code to bind our core logic
 * with the  svelte UI and obsidian API modal.
 */
export class TemplateBuilderModal extends Modal {
    _component!: TemplateBuilder;

    constructor(
        app: App,
        private deps: TemplateBuilderModel,
    ) {
        super(app);
    }

    onClose() {
        this._component.$destroy();
    }

    onOpen() {
        const { contentEl } = this;
        this._component = createClassComponent({
            component: TemplateBuilder,
            target: contentEl,
            props: { model: this.deps, copyToClipboard },
        });
    }
}
