import { App, Component, MarkdownRenderer, Setting } from "obsidian";

export function useSetting(
    element: HTMLElement,
    field: {
        name: string;
        description: string;
        customizer?: (setting: Setting) => void;
        app?: App;
    },
) {
    const setting = new Setting(element)
        .setName(field.name)
        .setDesc(field.description)
        .then(field.customizer || (() => {}));
    if (field.app && field.description) {
        const component = new Component();
        component.load();
        setting.descEl.empty();
        MarkdownRenderer.render(field.app, field.description, setting.descEl, "/", component);
        return {
            destroy() {
                component.unload();
            },
        };
    }
}
