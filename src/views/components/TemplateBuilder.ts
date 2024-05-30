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

function compileTemplaterTemplate(fields: Field[]) {
    const fieldsToInclude = fields.filter((field): field is FieldOption => !field.omit);
    const frontmatterFields = fieldsToInclude.filter((field) => field.onFrontmatter);
    const frontmatterCode =
        frontmatterFields.length === fieldsToInclude.length
            ? `tR + = result.asFrontmatterString();`
            : `tR + = result.asFrontmatterString({${frontmatterFields
                  .map((field) => field.name)
                  .join(", ")}});`;

    return `
    <% "--- "%>
    ${frontmatterCode}
    <% "--- "%>
    `;
}

export const makeModel = (formDefinition: FormDefinition) => {
    const fields = writable(
        formDefinition.fields.reduce((acc, { name }) => [...acc, Field(name)], [] as Field[]),
    );

    const code = derived(fields, compileTemplaterTemplate);

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
