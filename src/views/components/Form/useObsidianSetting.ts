import { Setting } from "obsidian";

export function useSetting(
    element: HTMLElement,
    field: {
        name: string;
        description: string;
        customizer?: (setting: Setting) => void;
    },
) {
    new Setting(element)
        .setName(field.name)
        .setDesc(field.description)
        .then(field.customizer || (() => {}));
}
