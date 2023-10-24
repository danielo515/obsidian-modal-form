import { Output, array, enumType, is, object, optional, safeParse, unknown } from "valibot";
import type { FormDefinition } from "./formDefinition";

const OpenPositionSchema = enumType(['left', 'right', 'mainView']);
export type OpenPosition = Output<typeof OpenPositionSchema>;

export const openPositions: Record<OpenPosition, string> = {
    left: 'Left',
    right: 'Right',
    mainView: 'Main View',
    // modal: 'Modal',
} as const;

export function isValidOpenPosition(position: string): position is OpenPosition {
    return is(OpenPositionSchema, position);
}

const ModalFormSettingsSchema = object({
    editorPosition: optional(OpenPositionSchema, 'right'),
    formDefinitions: array(unknown()),
});

const DEFAULT_SETTINGS: ModalFormSettings = {
    editorPosition: 'right',
    formDefinitions: [],
};
export function parseSettings(maybeSettings: unknown) {
    if (maybeSettings === null) return {
        success: true,
        issues: null,
        output: DEFAULT_SETTINGS,
    };
    return safeParse(ModalFormSettingsSchema, { ...DEFAULT_SETTINGS, ...maybeSettings });
}

export interface ModalFormSettings {
    editorPosition: OpenPosition;
    formDefinitions: FormDefinition[];
}
