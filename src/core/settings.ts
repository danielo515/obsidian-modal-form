import { Output, ValiError, array, enumType, is, object, optional, parse, unknown } from "valibot";
import type { FormDefinition } from "./formDefinition";
import * as E from 'fp-ts/Either';

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

// We intentionally don't use the FormDefinitionSchema here,
// because we don't want to parse the form definitions here.
// They will be parsed later so we can show a nice error message.
// This is due to a valibot limitation.
const ModalFormSettingsSchema = object({
    editorPosition: optional(OpenPositionSchema, 'right'),
    formDefinitions: array(unknown()),
});

type ModalFormSettingsPartial = Output<typeof ModalFormSettingsSchema>;

const DEFAULT_SETTINGS: ModalFormSettings = {
    editorPosition: 'right',
    formDefinitions: [],
};
export function parseSettings(maybeSettings: unknown): E.Either<ValiError, ModalFormSettingsPartial> {
    if (maybeSettings === null) return E.right(DEFAULT_SETTINGS)
        ;
    return E.tryCatch(() => parse(ModalFormSettingsSchema, { ...DEFAULT_SETTINGS, ...maybeSettings }), e => e as ValiError);
}

export interface ModalFormSettings {
    editorPosition: OpenPosition;
    formDefinitions: FormDefinition[];
}
