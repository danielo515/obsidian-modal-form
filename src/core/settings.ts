import { Output, ValiError, array, enumType, is, object, optional, unknown } from "valibot";
import type { FormDefinition, MigrationError } from "./formDefinition";
import * as E from 'fp-ts/Either';
import { pipe, parse } from "@std";

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

export function getDefaultSettings(): ModalFormSettings {
    return { ...DEFAULT_SETTINGS };
}

export class NullSettingsError {
    readonly _tag = 'NullSettingsError';
}

export function parseSettings(maybeSettings: unknown): E.Either<ValiError | NullSettingsError, ModalFormSettingsPartial> {
    return pipe(
        maybeSettings,
        E.fromNullable(new NullSettingsError()),
        E.chainW((s) => parse(ModalFormSettingsSchema, { ...DEFAULT_SETTINGS, ...s })),
    )
}

export interface ModalFormSettings {
    editorPosition: OpenPosition;
    formDefinitions: (FormDefinition | MigrationError)[];
}
