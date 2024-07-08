import type { App} from "obsidian";
import { Modal } from "obsidian";
import { createClassComponent } from "svelte/legacy";
import type { FormImportDeps} from "./FormImport";
import { makeFormInputModel } from "./FormImport";
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
        this._component = createClassComponent({
            component: FormImport,
            target: contentEl,
            props: { model: makeFormInputModel(this.deps) },
        });
    }
}
