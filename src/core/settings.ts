import { Output, ValiError, array, enumType, is, object, optional, unknown } from "valibot";
import type { FormDefinition } from "./formDefinition";
import type { MigrationError } from "./formDefinitionSchema";
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

export function getDefaultSettings(): ModalFormSettings {
    return { editorPosition: 'right', formDefinitions: [] };
}

export class NullSettingsError {
    readonly _tag = 'NullSettingsError';
}

/**
 * Parses the settings and returns a validation error if the settings are invalid.
 * The reason why we don't return default settings when the settings are invalid is because
 * in case of default settings there are several operations that could be skipped,
 * like migrations and validation.
 */
export function parseSettings(maybeSettings: unknown): E.Either<ValiError | NullSettingsError, ModalFormSettingsPartial> {
    return pipe(
        maybeSettings,
        E.fromNullable(new NullSettingsError()),
        E.chainW((s) => parse(ModalFormSettingsSchema, { ...getDefaultSettings(), ...s })),
    )
}

export interface ModalFormSettings {
    editorPosition: OpenPosition;
    formDefinitions: (MigrationError | FormDefinition)[];
}
