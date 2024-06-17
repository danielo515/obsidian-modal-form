import { A, pipe } from "@std";
import { FormDefinition } from "src/core/formDefinition";
import { buildResultBody } from "src/core/templater/builder";
import { derived, writable } from "svelte/store";

// type FieldDefinition = FormDefinition["fields"][number];

interface FieldOption {
    name: string;
    onFrontmatter: boolean;
    onBody: boolean;
    omit: false;
}

interface OmittedFieldOption {
    name: string;
    omit: true;
    // field: FieldDefinition;
}

type Field = FieldOption | OmittedFieldOption;

const Field = (name: string): FieldOption => ({
    name,
    onFrontmatter: false,
    onBody: false,
    omit: false,
});

function compileFrontmatter(fields: FieldOption[], resultName: string) {
    const frontmatterFields = fields
        .filter((field) => field.onFrontmatter)
        .map((field) => field.name);
    if (frontmatterFields.length === 0) {
        return "";
    }
    if (frontmatterFields.length === fields.length) {
        return `tR += ${resultName}.asFrontmatterString();`;
    }
    return `tR += ${resultName}.asFrontmatterString({ pick: ${JSON.stringify(
        frontmatterFields,
        null,
        16,
    )} \t});`;
}

function compileOpenForm(
    formName: string,
    resultName: string,
    fieldsToOmit: string[],
    usesGlobal: boolean = false,
) {
    const omitOptions =
        fieldsToOmit.length > 0 ? `, ${JSON.stringify({ omit: fieldsToOmit }, null, 8)}` : "";
    const args = `"${formName}"${omitOptions}`;
    console.log({ args });
    if (usesGlobal) {
        return [`const ${resultName} = await MF.openForm(${args});`];
    }
    return `
    const modalForm = app.plugins.plugins.modalforms.api;
    const ${resultName} = await modalForm.openForm(${args});`
        .trim()
        .split("\n")
        .map((x) => x.trim());
}

type Options = { includeFences: boolean; resultName: string };

function compileTemplaterTemplate(formName: string) {
    return ([fields, options, bodyTemplate]: [Field[], Options, string]) => {
        const fieldsToInclude = fields.filter((field): field is FieldOption => !field.omit);
        const fieldsToOmit = fields.filter((field): field is OmittedFieldOption => field.omit);
        const openTheform = compileOpenForm(
            formName,
            options.resultName,
            fieldsToOmit.map((x) => x.name),
        ).join("\n  ");

        return [
            options.includeFences ? `<% "---" %>` : "",
            `<%*`,
            `  ${openTheform}`,
            `  ${compileFrontmatter(fieldsToInclude, options.resultName)}`,
            `-%>`,
            options.includeFences ? `<% "---" %>` : "",

            buildResultBody(
                fieldsToInclude.map((f) => f.name),
                bodyTemplate,
                options,
            ),
        ]
            .filter(Boolean)
            .join("\n");
    };
}

export const makeModel = (formDefinition: FormDefinition) => {
    const fields = writable(
        formDefinition.fields.reduce((acc, { name }) => [...acc, Field(name)], [] as Field[]),
    );
    const options = writable<Options>({ includeFences: true, resultName: "result" });
    const bodyTemplate = writable("");

    const code = derived(
        [fields, options, bodyTemplate],
        compileTemplaterTemplate(formDefinition.name),
    );

    function setField(name: string, newValues: Partial<Field>) {
        console.log({ name, newValues });
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
    function toggleAllFrontmatter(value: boolean) {
        fields.update(($fields) =>
            $fields.map((f) => {
                if (f.omit) {
                    return f;
                }
                return { ...f, onFrontmatter: value };
            }),
        );
    }
    function omitField(name: string, value: boolean) {
        setField(name, { omit: value } as Field);
    }
    return {
        fields,
        setField,
        code,
        omitField,
        toggleAllFrontmatter,
        options,
        bodyTemplate,
        title: formDefinition.name,
    };
};

export type TemplateBuilderModel = ReturnType<typeof makeModel>;
