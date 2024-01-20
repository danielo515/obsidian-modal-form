import { App, Modal } from "obsidian";
import FormImport from "./FormImport.svelte";
import { makeFormInputModel } from "./FormImport";

export class FormImportModal extends Modal {
    _component!: FormImport;

    constructor(app: App) {
        super(app);
    }

    onClose() {
        this._component.$destroy();
    }

    onOpen() {
        const { contentEl } = this;
        this._component = new FormImport({
            target: contentEl,
            props: { model: makeFormInputModel() },
        });
    }
}
