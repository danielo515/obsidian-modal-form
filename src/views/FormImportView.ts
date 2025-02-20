import { App, Modal } from "obsidian";
import { FormImportDeps, makeFormImportModel } from "./FormImport";
import FormImport from "./FormImport.svelte";
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
            props: { model: makeFormImportModel(this.deps) },
        });
    }
}
