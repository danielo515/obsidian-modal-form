// This is the store that represents a runtime form. It is a writable store that contains the current state of the form
// and the errors that are present in the form. It is used by the Form component to render the form and to update the

import { pipe } from "@std";
import * as E from "fp-ts/Either";
import { absurd } from "fp-ts/function";
import * as A from "fp-ts/Array";
import { Writable, derived, writable, Readable, get } from "svelte/store";
import { toEntries } from "fp-ts/Record";

type Rule = { tag: 'required', message: string } //| { tag: 'minLength', length: number, message: string } | { tag: 'maxLength', length: number, message: string } | { tag: 'pattern', pattern: RegExp, message: string };
type Field = { value: string, name: string, rules?: Rule, errors: string[] }
type FormStore = { fields: Record<string, Field>, isValid: boolean };

interface FormEngine {
    /**
     * Adds a field to the form engine.
     * It returns an object with a writable store that represents the value of the field,
     * and a readable store that represents the errors of the field.
     * Use them to bind the field to the form and be notified of errors.
     * @param field a field definition to start tracking
     */
    addField: (field: { name: string }) => { value: Writable<string>, errors: Readable<string[]> };
    /**
     * Subscribes to the form store. This method is required to conform to the svelte store interface.
     */
    subscribe: Readable<FormStore>['subscribe'];
    /**
     * Readable store that represents the validity of the form.
     * If any of the fields in the form have errors, this will be false.
     */
    isValid: Readable<boolean>;
    /**
     * Wrapper around the provided onSubmit function that validates the form before calling the provided function.
     * If the form is invalid, the errors are updated and the onSubmit function is not called.
     */
    onSubmit: () => void;
}
/**
 * 
 * Validates a field based on the rules that are present on the field.
 * If the field meets the requirements, the field is returned as is in a right.
 * If the field does not meet the requirements, the field is returned with the errors in a left.
 */
function parseField(field: Field): E.Either<Field, Field> {
    if (!field.rules) return E.right(field)
    switch (field.rules.tag) {
        case 'required': return field.value ? E.right(field) : E.left({ ...field, errors: [...field.errors, field.rules.message] })
        default: return absurd(field.rules.tag)
    }
}

/**
 * Transforms a the fields of a form into a validated record of results,
 * or returns a list of fields that failed validation.
 */
function parseForm(fields: Record<string, { value: string, name: string, rules?: Rule }>): E.Either<Field[], Record<string, string>> {
    const { right: ok, left: failed } = pipe(fields, Object.values, A.map(parseField), A.separate)
    if (failed.length > 0) return E.left(failed)
    return E.right(pipe(ok, A.map((field) => [field.name, field.value]), Object.fromEntries))
}

export function makeFormEngine(onSubmit: (values: Record<string, string>) => void): FormEngine {
    const formStore: Writable<FormStore> = writable({ fields: {}, isValid: false });

    function setFormField(name: string) {
        return (value: string, errors = [], rules?: Rule) => {
            formStore.update((form) => {
                return { ...form, fields: { ...form.fields, [name]: { value: value, name, errors, rules } } }
            })
        }
    }

    function setErrors(failedFields: Field[]) {
        formStore.update((form) => {
            return pipe(failedFields, A.reduce(form, (form, field) => {
                return { ...form, fields: { ...form.fields, [field.name]: field } }
            }))
        })
    }

    // TODO: Validate on updates, reactive isValid, dependent fields, handle more than just strings
    const formEngine: FormEngine = {
        subscribe: formStore.subscribe,
        isValid: derived(formStore, ({ fields }) => pipe(
            fields,
            toEntries,
            A.some(([_, f]) => f.errors.length > 0),
            (x) => !x)
        ),
        onSubmit() {
            const formState = get(formStore)
            pipe(formState.fields, parseForm, E.match(setErrors, onSubmit))
        },
        addField: (field) => {
            const setField = setFormField(field.name);
            setField('');
            const fieldStore = derived(formStore, ({ fields }) => fields[field.name]);
            const fieldValueStore: Writable<string> = {
                subscribe(cb) {
                    return fieldStore.subscribe((value) => cb(value?.value ?? ''));
                },
                set(value) {
                    setField(value);
                },
                update: (updater) => {
                    formStore.update((form) => {
                        const current = form.fields[field.name];
                        if (!current) {
                            console.error(new Error(`Field ${field.name} does not exist`))
                            return form
                        }
                        const newValue = (updater(current.value)) ?? ''
                        return { ...form, fields: { ...form.fields, [field.name]: { ...current, value: newValue, errors: [] } } }
                    });
                },
            }
            return { value: fieldValueStore, errors: derived(formStore, ({ fields }) => fields[field.name]?.errors ?? []) };
        }
    }

    return formEngine;
}
