import { AllFieldTypes, FieldDefinition, FormDefinition, validateFields } from "./formDefinition";

type FieldArgs = { name: string; label?: string; description?: string; required?: boolean };

type FieldBuilderMethods = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in AllFieldTypes]: (...args: any[]) => any;
};

export class FormBuilder implements FieldBuilderMethods {
    [key: string]: any;
    definition: FormDefinition;

    constructor(
        { name, fields, title, version }: FormDefinition,
        private reporter: (title: string, message: string) => void,
    ) {
        this.definition = { name, fields, title, version };
    }

    private addField = (
        { name, label, description, required }: FieldArgs,
        input: FormDefinition["fields"][0]["input"],
    ) => {
        const textField: FieldDefinition = {
            name,
            label,
            description: description || "",
            input,
            isRequired: required,
        };
        return new FormBuilder(
            {
                ...this.definition,
                fields: [...this.definition.fields, textField],
            },
            this.reporter,
        );
    };

    addTextField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "text", hidden: Boolean(hidden) });

    text = this.addTextField;

    addNumberField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "number", hidden: Boolean(hidden) });

    addDateField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "date", hidden: Boolean(hidden) });

    addTimeField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "time", hidden: Boolean(hidden) });

    addDateTimeField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "datetime", hidden: Boolean(hidden) });

    addTextareaField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "textarea", hidden: Boolean(hidden) });

    addToggleField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "toggle", hidden: Boolean(hidden) });

    addEmailField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "email", hidden: Boolean(hidden) });

    addTelField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "tel", hidden: Boolean(hidden) });

    addNoteField = ({ name, label, description, folder, required }: FieldArgs & { folder: string }) =>
        this.addField({ name, label, description, required }, { type: "note", folder });

    addFolderField = ({
        name,
        label,
        description,
        parentFolder,
        required,
    }: FieldArgs & { parentFolder?: string }) =>
        this.addField({ name, label, description, required }, { type: "folder", parentFolder });

    addSliderField = ({
        name,
        label,
        description,
        min,
        max,
        required,
    }: FieldArgs & { min?: number; max: number }) =>
        this.addField({ name, label, description, required }, { type: "slider", min: min ?? 0, max });

    addTagField = ({ name, label, description, hidden, required }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description, required }, { type: "tag", hidden: Boolean(hidden) });

    addSelectField = ({
        name,
        label,
        description,
        options,
        hidden,
        required,
    }: FieldArgs & { hidden?: boolean; options: (string | { value: string; label: string })[] }) =>
        this.addField(
            { name, label, description, required },
            {
                type: "select",
                source: "fixed",
                options: options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)),
            },
        );

    addDataviewField = ({ name, label, description, query, required }: FieldArgs & { query: string }) =>
        this.addField({ name, label, description, required }, { type: "dataview", query });

    addMultiselectField = ({
        name,
        label,
        description,
        allowUnknownValues,
        options,
        required,
    }: FieldArgs & { allowUnknownValues?: boolean; options: string[] }) =>
        this.addField(
            { name, label, description, required },
            {
                type: "multiselect",
                source: "fixed",
                multi_select_options: options,
                allowUnknownValues: Boolean(allowUnknownValues),
            },
        );

    addDocumentBlockField = ({ name, label, description, body, required }: FieldArgs & { body: string }) =>
        this.addField({ name, label, description, required }, { type: "document_block", body });

    addMarkdownBlockField = ({ name, label, description, body, required }: FieldArgs & { body: string }) =>
        this.addField({ name, label, description, required }, { type: "markdown_block", body });

    addImageField = ({
        name,
        label,
        description,
        filenameTemplate,
        saveLocation,
        required,
    }: FieldArgs & { filenameTemplate: string; saveLocation: string }) =>
        this.addField(
            { name, label, description, required },
            { type: "image", filenameTemplate, saveLocation },
        );

    addFileField = ({
        name,
        label,
        description,
        folder,
        allowedExtensions,
        required,
    }: FieldArgs & { folder: string; allowedExtensions: string[] }) =>
        this.addField({ name, label, description, required }, { type: "file", folder, allowedExtensions });

    number = this.addNumberField;
    date = this.addDateField;
    time = this.addTimeField;
    datetime = this.addDateTimeField;
    textarea = this.addTextareaField;
    toggle = this.addToggleField;
    email = this.addEmailField;
    tel = this.addTelField;
    note = this.addNoteField;
    folder = this.addFolderField;
    slider = this.addSliderField;
    tag = this.addTagField;
    select = this.addSelectField;
    dataview = this.addDataviewField;
    multiselect = this.addMultiselectField;
    document_block = this.addDocumentBlockField;
    markdown_block = this.addMarkdownBlockField;
    image = this.addImageField;
    file = this.addFileField;

    build = (): FormDefinition => {
        const fieldsValidation = validateFields(this.definition.fields);
        if (fieldsValidation.length > 0) {
            this.reporter(
                "🚧 Error building form 🚧",
                fieldsValidation.map((x: { path?: string; message: string }) => `${x.path}: ${x.message}`).join("\n"),
            );
        }
        return this.definition;
    };
}

export const makeBuilder = (reporter: (title: string, message: string) => void) =>
    function createBuilder(name: string, title?: string, fields: FormDefinition["fields"] = []) {
        return new FormBuilder({ name, title: title || name, fields, version: "1" }, reporter);
    };
