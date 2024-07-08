import type { App} from "obsidian";
import { Modal } from "obsidian";
import type { SvelteComponent } from "svelte";
import { createClassComponent } from "svelte/legacy";

type SvelteProps = ConstructorParameters<typeof SvelteComponent>[0];

/**
 * Generid modal utility class that can be used to easily display a modal
 * using any Svelte component.
 */
export class SvelteModal<T extends SvelteProps> extends Modal {
    _component!: SvelteComponent<T>;

    constructor(
        app: App,
        private component: typeof SvelteComponent<T>,
        private getProps: (modal: Modal) => T,
    ) {
        super(app);
    }

    onClose() {
        this._component.$destroy();
    }

    onOpen() {
        const { contentEl } = this;
        this._component = createClassComponent({
            component: this.component,
            target: contentEl,
            props: this.getProps(this),
        });
    }
}
