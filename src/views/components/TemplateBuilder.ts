import { A, pipe } from "@std";
import { FormDefinition } from "src/core/formDefinition";
import { writable } from "svelte/store";

// type FieldDefinition = FormDefinition["fields"][number];

interface FieldOption {
    name: string;
    onFrontmatter: boolean;
    onBody: boolean;
    omit: false;
}

interface OmitedFieldOption {
    name: string;
    omit: true;
    // field: FieldDefinition;
}

type Field = FieldOption | OmitedFieldOption;

const Field = (name: string): FieldOption => ({
    name,
    onFrontmatter: false,
    onBody: false,
    omit: false,
});

export const makeModel = (formDefinition: FormDefinition) => {
    const fields = writable(
        formDefinition.fields.reduce((acc, { name }) => [...acc, Field(name)], [] as Field[]),
    );

    // function setField(name: string, newValues: Partial<FieldOption>) {
    //     fields.update((f) => {
    //         const field = f[name] ?? { name, onFrontmatter: false, onBody: false };
    //         f[name] = { ...field, ...newValues };
    //         return f;
    //     });
    // }

    function setField(name: string, newValues: Partial<FieldOption>) {
        fields.update(($fields) =>
            pipe(
                $fields,
                A.updateFirst(
                    (f) => f.name === name,
                    (f) => {
                        return { ...f, ...newValues } as Field;
                    },
                ),
            ),
        );
    }
    return { fields, setField };
};

export type TemplateBuilderModel = ReturnType<typeof makeModel>;
