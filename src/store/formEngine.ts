import * as R from "fp-ts/Record";
// This is the store that represents a runtime form. It is a writable store that contains the current state of the form
// and the errors that are present in the form. It is used by the Form component to render the form and to update the

import { input } from "@core";
import type { NonEmptyArray } from "@std";
import { flow, pipe } from "@std";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import type { Option } from "fp-ts/Option";
import * as O from "fp-ts/Option";
import { fromEntries, toEntries } from "fp-ts/Record";
import { absurd } from "fp-ts/function";
import { FileProxy } from "src/core/files/FileProxy";
import { FieldDefinition } from "src/core/formDefinition";
import { isBasicInputType, valueMeetsCondition } from "src/core/input";
import { logger, type Logger } from "src/utils/Logger";
import type { Readable, Writable } from "svelte/store";
import { derived, get, writable } from "svelte/store";

type Rule = { tag: "required"; message: string }; //| { tag: 'minLength', length: number, message: string } | { tag: 'maxLength', length: number, message: string } | { tag: 'pattern', pattern: RegExp, message: string };
function requiredRule(fieldName: string, message?: string): Rule {
    return { tag: "required", message: message ?? `'${fieldName}' is required` };
}
export type FieldValue = string | boolean | number | FileProxy | string[];
type Field<T extends FieldValue> = Readonly<{
    value: Option<T>;
    name: string;
    rules?: Rule;
    errors: string[];
}>;
type FieldFailed<T extends FieldValue> = {
    value: Option<T>;
    name: string;
    rules: Rule;
    errors: NonEmptyArray<string>;
};
function FieldFailed<T extends FieldValue>(field: Field<T>, failedRule: Rule): FieldFailed<T> {
    return { ...field, rules: failedRule, errors: [failedRule.message] };
}
type FormStore<T extends FieldValue> = {
    fields: Record<string, Field<T>>;
    status: "submitted" | "cancelled" | "draft";
};

// TODO: instead of making the whole engine generic, make just the addField method generic extending the type of the field value
// Then, the whole formEngine can be typed as FormEngine<FieldValue>
export interface FormEngine {
    /**
     * Adds a field to the form engine.
     * It returns an object with a writable store that represents the value of the field,
     * and a readable store that represents the errors of the field.
     * Use them to bind the field to the form and be notified of errors.
     * @param field a field definition to start tracking
     */
    addField(field: { name: string; label?: string; isRequired?: boolean }): {
        value: Writable<FieldValue>;
        errors: Readable<string[]>;
        isVisible: Readable<E.Either<string, boolean>>;
    };
    /**
     * Subscribes to the form store. This method is required to conform to the svelte store interface.
     */
    subscribe: Readable<FormStore<FieldValue>>["subscribe"];
    /**
     * Readable store that represents the validity of the form.
     * If any of the fields in the form have errors, this will be false.
     */
    isValid: Readable<boolean>;
    /**
     * Wrapper around the provided onSubmit function that validates the form before calling the provided function.
     * If the form is invalid, the errors are updated and the onSubmit function is not called.
     */
    triggerSubmit: () => void;
    /**
     * Cancels the form and calls the onCancel function.
     * In the future we may add a confirmation dialog before calling the onCancel function.
     * or even persist the form state to allow the user to resume later.
     */
    triggerCancel: () => void;
    errors: Readable<string[]>;
}
function nonEmptyValue(s: FieldValue): Option<FieldValue> {
    switch (typeof s) {
        case "string":
            return s.length > 0 ? O.some(s) : O.none;
        case "number":
        case "boolean":
            return O.some(s);
        case "object":
            return Array.isArray(s) ? (s.length > 0 ? O.some(s) : O.none) : O.none;
        default:
            return absurd(s);
    }
}
/**
 *
 * Validates a field based on the rules that are present on the field.
 * If the field meets the requirements, the field is returned as is in a right.
 * If the field does not meet the requirements, the field is returned with the errors in a left.
 */
function parseField<T extends FieldValue>(field: Field<T>): E.Either<FieldFailed<T>, Field<T>> {
    if (!field.rules) return E.right(field);
    const rule = field.rules;
    switch (rule.tag) {
        case "required":
            return pipe(
                field.value,
                O.chain(nonEmptyValue),
                O.match(
                    () => E.left(FieldFailed(field, rule)),
                    (value) => E.right(field),
                ),
            );
        default:
            return absurd(rule.tag);
    }
}

/**
 * Transforms a the fields of a form into a validated record of results,
 * or returns a list of fields that failed validation.
 */
function parseForm<T extends FieldValue>(
    fields: Record<string, Field<T>>,
): E.Either<Field<T>[], Record<string, T>> {
    const { right: ok, left: failed } = pipe(
        fields,
        Object.values,
        A.map(parseField<T>),
        A.separate,
    );
    if (failed.length > 0) return E.left(failed);
    return E.right(
        pipe(
            ok,
            A.map((field) =>
                pipe(
                    field.value,
                    O.map((value) => [field.name, value] as [string, T]),
                ),
            ),
            A.compact,
            fromEntries,
        ),
    );
}

export type OnFormSubmit<T> = (values: Record<string, T>) => void;

type makeFormEngineArgs<T> = {
    onSubmit: OnFormSubmit<T>;
    onCancel: () => void;
    defaultValues?: Record<string, T>;
    logger?: Logger;
};

export function makeFormEngine({
    onSubmit,
    onCancel,
    defaultValues = {},
    logger: l = logger,
}: makeFormEngineArgs<FieldValue>): FormEngine {
    const formStore: Writable<FormStore<FieldValue>> = writable({ fields: {}, status: "draft" });
    /** Creates helper functions to modify the store immutably*/
    function setFormField({ name, input }: FieldDefinition) {
        /**
         * Initializes a field in the form store with the provided errors, rules
         * and default values (read from the defaultValues object passed to the form engine)
         */
        function initField(errors = [], rules?: Rule) {
            formStore.update((form) => {
                return {
                    ...form,
                    fields: {
                        ...form.fields,
                        [name]: { value: O.fromNullable(defaultValues[name]), name, errors, rules },
                    },
                };
            });
        }
        function setValue<T extends FieldValue>(value: T) {
            formStore.update((form) => {
                const field = form.fields[name];
                if (!field) {
                    l.error(new Error(`Field ${name} does not exist`));
                    return form;
                }
                return {
                    ...form,
                    fields: {
                        ...form.fields,
                        [name]: { ...field, value: O.some(value), errors: [] },
                    },
                };
            });
        }
        return { initField, setValue };
    }

    function setErrors<T extends FieldValue>(failedFields: Field<T>[]) {
        formStore.update((form) => {
            return pipe(
                failedFields,
                A.reduce(form, (form, field) => {
                    return {
                        ...form,
                        fields: { ...form.fields, [field.name]: field },
                    };
                }),
            );
        });
    }

    const errors = derived(formStore, ({ fields }) =>
        pipe(
            fields,
            R.toEntries,
            A.filterMap(([_, f]) => (f.errors.length > 0 ? O.some(f.errors) : O.none)),
            A.flatten,
        ),
    );

    // TODO: dependent fields, handle more than just strings
    return {
        subscribe: formStore.subscribe,
        errors,
        isValid: derived(formStore, ({ fields }) =>
            pipe(
                fields,
                toEntries,
                A.some(([_, f]) => f.errors.length > 0),
                (x) => !x,
            ),
        ),
        triggerSubmit() {
            formStore.update((form) => ({ ...form, status: "submitted" }));
            const formState = get(formStore);
            // prettier-ignore
            pipe(
                formState.fields, 
                parseForm, 
                E.match(setErrors, onSubmit)
            );
        },
        triggerCancel() {
            formStore.update((form) => ({ ...form, status: "cancelled" }));
            onCancel?.();
        },
        addField(field: FieldDefinition) {
            l.debug("Adding field", field.name);
            const { initField: setField, setValue } = setFormField(field);
            setField([], field.isRequired ? requiredRule(field.label || field.name) : undefined);
            const fieldStore = derived(formStore, ({ fields }) => fields[field.name]);
            const fieldValueStore: Writable<FieldValue> = {
                subscribe(cb) {
                    return fieldStore.subscribe((x) =>
                        pipe(
                            x,
                            O.fromNullable,
                            O.chain((x) => x.value),
                            O.map(cb),
                        ),
                    );
                },
                set(value) {
                    setValue(value);
                },
                update: (updater) => {
                    formStore.update((form) => {
                        const current = form.fields[field.name];
                        if (!current) {
                            console.error(new Error(`Field ${field.name} does not exist`));
                            return form;
                        }
                        const newValue = pipe(
                            // fuck prettier
                            current.value,
                            input.requiresListOfStrings(field.input)
                                ? O.match(() => O.of(updater([])), flow(updater, O.of))
                                : O.map(updater),
                        );
                        return {
                            ...form,
                            fields: {
                                ...form.fields,
                                [field.name]: {
                                    ...current,
                                    value: newValue,
                                    errors: [],
                                },
                            },
                        };
                    });
                },
            };
            const isVisible = derived(formStore, ($form): E.Either<string, boolean> => {
                l.debug(
                    "condition",
                    field.name,
                    field.condition && $form.fields[field.condition.dependencyName],
                );
                if (isBasicInputType(field.input)) {
                    if (field.input.hidden) {
                        return E.of(false);
                    }
                }
                if (field.isRequired) return E.of(true);
                const condition = field.condition;
                if (condition === undefined) return E.of(true);
                return pipe(
                    $form.fields[condition.dependencyName],
                    E.fromNullable(
                        `Field '${condition.dependencyName}' which is a dependency of '${field.name}' does not exist`,
                    ),
                    E.map((f) => valueMeetsCondition(condition, O.toUndefined(f.value))),
                );
            });
            return {
                value: fieldValueStore,
                isVisible,
                errors: derived(formStore, ({ fields }) => fields[field.name]?.errors ?? []),
            };
        },
    };
}
