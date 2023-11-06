import { A, pipe } from '@std';
import { FormDefinition, duplicateForm } from 'src/core/formDefinition';
import { MigrationError } from 'src/core/formDefinitionSchema';
import { ModalFormSettings, getDefaultSettings } from 'src/core/settings';
import { writable, derived } from 'svelte/store';

const settings = writable({ ...getDefaultSettings() });
export const formsStore = derived(settings, ($settings) => pipe($settings.formDefinitions, A.filter((form): form is FormDefinition => !(form instanceof MigrationError))));
const { subscribe, update, set } = settings

export const invalidFormsStore = derived(settings, ($settings) => {
    return pipe($settings.formDefinitions,
        A.filter((form): form is MigrationError => form instanceof MigrationError));
})

export const settingsStore = {
    subscribe,
    set,
    updateForm(name: string, form: FormDefinition) {
        update((s): ModalFormSettings => {
            const forms = s.formDefinitions.map((f) => {
                if (f.name === name) return form;
                return f;
            });
            return { ...s, formDefinitions: forms };
        });
    },
    addNewForm(form: FormDefinition) {
        update((s): ModalFormSettings => {
            const forms = [...s.formDefinitions, form];
            return { ...s, formDefinitions: forms };
        });
    },
    removeForm(name: string) {
        update((s): ModalFormSettings => {
            const forms = s.formDefinitions.filter((f) => f.name !== name);
            return { ...s, formDefinitions: forms };
        });
    },
    duplicateForm(formName: string) {
        update((s): ModalFormSettings => {
            return { ...s, formDefinitions: duplicateForm(formName, s.formDefinitions) }
        });
    }
}
