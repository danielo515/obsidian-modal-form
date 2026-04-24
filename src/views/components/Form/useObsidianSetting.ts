import { App, Component, MarkdownRenderer, Setting } from "obsidian";

type SettingField = {
    name: string;
    description: string;
    customizer?: (setting: Setting) => void;
    app?: App;
};

function showRenderError(el: HTMLElement, err: unknown) {
    el.empty();
    console.error("Failed to render markdown description", err);
    const msg = err instanceof Error ? err.message : String(err);
    el.createDiv({
        cls: "modal-form-description-error",
        text: `Failed to render description: ${msg}`,
    });
}

export function useSetting(element: HTMLElement, field: SettingField) {
    const setting = new Setting(element)
        .setName(field.name)
        .setDesc(field.description)
        .then(field.customizer || (() => {}));
    let component: Component | undefined;
    const renderDescription = (next: SettingField) => {
        if (next.app && next.description) {
            if (!component) {
                component = new Component();
                component.load();
            }
            setting.descEl.empty();
            MarkdownRenderer.render(next.app, next.description, setting.descEl, "/", component)
                .catch((e) => showRenderError(setting.descEl, e));
        } else {
            setting.descEl.empty();
            setting.setDesc(next.description);
        }
    };
    if (field.app && field.description) renderDescription(field);
    return {
        update(next: SettingField) {
            if (next.name !== field.name) setting.setName(next.name);
            if (next.description !== field.description || next.app !== field.app) {
                renderDescription(next);
            }
            field = next;
        },
        destroy() {
            component?.unload();
        },
    };
}
