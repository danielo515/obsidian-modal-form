import * as J from "fp-ts/Json";
import { O, type Option, ensureError, pipe } from "@std";
import * as E from "fp-ts/Either";
import { InvalidData, MigrationError, migrateToLatest } from "src/core/formDefinitionSchema";
import { Readable, writable } from "svelte/store";
import { FormDefinition } from "src/core/formDefinition";

type State = E.Either<string[], Option<FormDefinition>>;
type UiState = {
    canSubmit: boolean;
    errors: string[];
    onSubmit: () => void;
    buttonHint: string;
};

export interface FormImportModel {
    readonly state: Readable<State>;
    readonly validate: (value: string) => void;
    uiState(state: State): UiState;
}

export interface Matchers<T> {
    empty(): T;
    ok(form: FormDefinition): T;
    error(errors: string[]): T;
}

export interface FormImportDeps {
    createForm(form: FormDefinition): void;
}

function matchState<T>(state: State, matchers: Matchers<T>): T {
    return pipe(
        state,
        E.match(matchers.error, (form) =>
            pipe(
                form,
                // prettier, shut up
                O.match(matchers.empty, matchers.ok),
            ),
        ),
    );
}

function noop() {}

export function makeFormInputModel({ createForm }: FormImportDeps): FormImportModel {
    const state = writable<State>(E.of(O.none));
    const setErrors = (errors: string[]) => state.set(E.left(errors));
    const resetState = () => state.set(E.of(O.none));
    return {
        state,
        uiState(state) {
            return matchState<UiState>(state, {
                empty: () => ({ canSubmit: false, errors: [], onSubmit: noop, buttonHint: "" }),
                ok: (form) => ({
                    canSubmit: true,
                    errors: [],
                    onSubmit: () => createForm(form),
                    buttonHint: "✅",
                }),
                error: (errors) => ({ canSubmit: false, errors, onSubmit: noop, buttonHint: "❌" }),
            });
        },
        validate: (value: string) => {
            if (value.trim() === "") {
                resetState();
                return;
            }
            pipe(
                value,
                J.parse,
                E.mapLeft(ensureError),
                E.chainW(migrateToLatest),
                E.match(
                    (error) => {
                        if (error instanceof InvalidData) {
                            setErrors(error.toArrayOfStrings());
                            return;
                        }
                        setErrors([error.toString()]);
                    },
                    (form) => {
                        if (form instanceof MigrationError) {
                            setErrors(form.toArrayOfStrings());
                            return;
                        }
                        state.set(E.of(O.some(form)));
                        console.log(form);
                    },
                ),
            );
        },
    };
}
