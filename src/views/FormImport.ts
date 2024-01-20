import * as J from "fp-ts/Json";
import { ensureError, pipe } from "@std";
import * as E from "fp-ts/Either";
import { InvalidData, MigrationError, migrateToLatest } from "src/core/formDefinitionSchema";
import { Readable, writable } from "svelte/store";

export interface FormInputModel {
    readonly errors: Readable<string[]>;
    readonly validate: (value: string) => void;
}

export function makeFormInputModel(): FormInputModel {
    const errors = writable<string[]>([]);
    return {
        errors,
        validate: (value: string) => {
            if (value.trim() === "") {
                errors.set([]);
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
                            errors.set(error.toArrayOfStrings());
                            return;
                        }
                        errors.set([error.toString()]);
                    },
                    (form) => {
                        if (form instanceof MigrationError) {
                            errors.set(form.toArrayOfStrings());
                            return;
                        }
                        errors.set([]);
                        console.log(form);
                    },
                ),
            );
        },
    };
}
