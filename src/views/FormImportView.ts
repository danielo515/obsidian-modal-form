import { App, Modal } from "obsidian";
import FormImport from "./FormImport.svelte";
import { FormImportDeps, makeFormInputModel } from "./FormImport";
/**
 * This class is just the minimum glue code to bind our core logic
 * with the  svelte UI and obsidian API modal.
 */
export class FormImportModal extends Modal {
    _component!: FormImport;

    constructor(
        app: App,
        private deps: FormImportDeps,
    ) {
        super(app);
    }

    onClose() {
        this._component.$destroy();
    }

    onOpen() {
        const { contentEl } = this;
        this._component = new FormImport({
            target: contentEl,
            props: { model: makeFormInputModel(this.deps) },
        });
    }
}
