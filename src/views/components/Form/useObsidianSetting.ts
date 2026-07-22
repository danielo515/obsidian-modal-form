import { Setting } from "obsidian";

export function useSetting(
    element: HTMLElement,
    field: {
        name: string;
        description: string;
        fieldName?: string;
        customizer?: (setting: Setting) => void;
    },
) {
    const setting = new Setting(element)
        .setName(field.name)
        .setDesc(field.description)
        .then(field.customizer || (() => {}));
    if (field.fieldName) {
        setting.settingEl.setAttribute("data-field-name", field.fieldName);
    }
}
