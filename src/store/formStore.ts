// This is the store that represents a runtime form. It is a writable store that contains the current state of the form
// and the errors that are present in the form. It is used by the Form component to render the form and to update the

import { Writable, derived, writable, Readable } from "svelte/store";
type FormStore = { fields: Record<string, { value: string, errors: string[] }>, isValid: boolean };
const formStore: Writable<FormStore> = writable({ fields: {}, isValid: false });

interface FormEngine {
    addField: (field: { name: string }) => { field: Writable<string>, errors: Readable<string[]> };
    subscribe: Readable<FormStore>['subscribe'];
    isValid: () => boolean;
}

// TODO: Validate on updates, reactive isValid, dependent fields, handle more than just strings
export const formEngine: FormEngine = {
    subscribe: formStore.subscribe,
    isValid: () => true,
    addField: (field) => {
        formStore.update((form) => {
            return { ...form, fields: { ...form.fields, [field.name]: { value: '', errors: [] } } }
        });
        const fieldStore = derived(formStore, ({ fields }) => fields[field.name]);
        const fieldValueStore: Writable<string> = {
            subscribe(cb) {
                return fieldStore.subscribe((value) => cb(value?.value ?? ''));
            },
            set(value) {
                formStore.update((form) => {
                    return { ...form, fields: { ...form.fields, [field.name]: { value, errors: [] } } }
                });
            },
            update: (updater) => {
                formStore.update((form) => {
                    const current = form.fields[field.name];
                    const newValue = (current?.value && updater(current.value)) ?? ''
                    return { ...form, fields: { ...form.fields, [field.name]: { value: newValue, errors: [] } } }
                });
            },
        }
        return { field: fieldValueStore, errors: derived(formStore, ({ fields }) => fields[field.name]?.errors ?? []) };
    }
}
