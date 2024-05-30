import { A, pipe } from "@std";
import { FormDefinition } from "src/core/formDefinition";
import { derived, writable } from "svelte/store";

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

function compileFrontmatter(fields: FieldOption[]) {
    const frontmatterFields = fields
        .filter((field) => field.onFrontmatter)
        .map((field) => field.name);
    if (frontmatterFields.length === 0) {
        return "";
    }
    if (frontmatterFields.length === fields.length) {
        return `tR + = result.asFrontmatterString();`;
    }
    return `tR + = result.asFrontmatterString({ pick: ${JSON.stringify(
        frontmatterFields,
        null,
        2,
    )} });`;
}

function compileTemplaterTemplate(formName: string) {
    return (fields: Field[]) => {
        const fieldsToInclude = fields.filter((field): field is FieldOption => !field.omit);

        return `
    <% "--- "%>
    const result = MF.openForm("${formName}");
    ${compileFrontmatter(fieldsToInclude)}
    <% "--- "%>
    `;
    };
}

export const makeModel = (formDefinition: FormDefinition) => {
    const fields = writable(
        formDefinition.fields.reduce((acc, { name }) => [...acc, Field(name)], [] as Field[]),
    );

    const code = derived(fields, compileTemplaterTemplate(formDefinition.name));

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
    return { fields, setField, code };
};

export type TemplateBuilderModel = ReturnType<typeof makeModel>;
