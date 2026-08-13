import { Setting } from "obsidian";

export function useSetting(
    element: HTMLElement,
    field: {
        name: string;
        description: string;
        fieldName?: string;
        required?: boolean;
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
    // Match the ObsidianInputWrapper styling: append a red asterisk after
    // the field name so required-field indicators are consistent across
    // every field type, including the ones (toggle, folder) that render
    // through Obsidian's native Setting rather than our own wrapper.
    if (field.required) {
        setting.nameEl.appendChild(
            createSpan({ cls: "modal-form-required", text: "*" }),
        );
    }
}
