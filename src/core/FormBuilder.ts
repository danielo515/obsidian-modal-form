import { input } from "./index";
import { AllFieldTypes, FieldDefinition, FormDefinition, validateFields } from "./formDefinition";

type FieldArgs = {
    name: string;
    label?: string;
    description?: string;
    required?: boolean;
    condition?: input.Condition;
};

type FieldBuilderMethods = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in AllFieldTypes]: (...args: any[]) => any;
};

export class FormBuilder implements FieldBuilderMethods {
    definition: FormDefinition;

    constructor(
        { name, fields, title, version }: FormDefinition,
        private reporter: (title: string, message: string) => void,
    ) {
        this.definition = { name, fields, title, version };
    }

    private addField = (
        { name, label, description, required, condition }: FieldArgs,
        input: FormDefinition["fields"][0]["input"],
    ) => {
        const textField: FieldDefinition = {
            name,
            label,
            description: description || "",
            isRequired: required,
            input,
            ...(condition ? { condition } : {}),
        };
        return new FormBuilder(
            {
                ...this.definition,
                fields: [...this.definition.fields, textField],
            },
            this.reporter,
        );
    };

    addTextField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "text", hidden: Boolean(hidden) });

    text = this.addTextField;

    addNumberField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "number", hidden: Boolean(hidden) });

    addDateField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "date", hidden: Boolean(hidden) });

    addTimeField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "time", hidden: Boolean(hidden) });

    addDateTimeField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "datetime", hidden: Boolean(hidden) });

    addTextareaField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "textarea", hidden: Boolean(hidden) });

    addToggleField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "toggle", hidden: Boolean(hidden) });

    addEmailField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "email", hidden: Boolean(hidden) });

    addTelField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "tel", hidden: Boolean(hidden) });

    addNoteField = ({ folder, ...rest }: FieldArgs & { folder: string }) =>
        this.addField(rest, { type: "note", folder });

    addFolderField = ({ parentFolder, ...rest }: FieldArgs & { parentFolder?: string }) =>
        this.addField(rest, { type: "folder", parentFolder });

    addSliderField = ({ min, max, ...rest }: FieldArgs & { min?: number; max: number }) =>
        this.addField(rest, { type: "slider", min: min ?? 0, max });

    addTagField = ({ hidden, ...rest }: FieldArgs & { hidden?: boolean }) =>
        this.addField(rest, { type: "tag", hidden: Boolean(hidden) });

    addSelectField = ({
        options,
        ...rest
    }: FieldArgs & { hidden?: boolean; options: (string | { value: string; label: string })[] }) =>
        this.addField(rest, {
            type: "select",
            source: "fixed",
            options: options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)),
        });

    addSelectFromNotesField = ({ folder, ...rest }: FieldArgs & { folder: string }) =>
        this.addField(rest, { type: "select", source: "notes", folder });

    addDataviewField = ({ query, ...rest }: FieldArgs & { query: string }) =>
        this.addField(rest, { type: "dataview", query });

    addMultiselectField = ({
        allowUnknownValues,
        options,
        ...rest
    }: FieldArgs & { allowUnknownValues?: boolean; options: string[] }) =>
        this.addField(rest, {
            type: "multiselect",
            source: "fixed",
            multi_select_options: options,
            allowUnknownValues: Boolean(allowUnknownValues),
        });

    addMultiselectNotesField = ({
        folder,
        folders,
        ...rest
    }: FieldArgs & { folder: string; folders?: string[] }) =>
        this.addField(rest, {
            type: "multiselect",
            source: "notes",
            folder,
            ...(folders != null && folders.length > 0 ? { folders } : {}),
        });

    addMultiselectQueryField = ({
        allowUnknownValues,
        query,
        ...rest
    }: FieldArgs & { allowUnknownValues?: boolean; query: string }) =>
        this.addField(rest, {
            type: "multiselect",
            source: "dataview",
            query,
            allowUnknownValues: Boolean(allowUnknownValues),
        });

    addDocumentBlockField = ({ body, ...rest }: FieldArgs & { body: string }) =>
        this.addField(rest, { type: "document_block", body });

    addMarkdownBlockField = ({ body, ...rest }: FieldArgs & { body: string }) =>
        this.addField(rest, { type: "markdown_block", body });

    addImageField = ({
        filenameTemplate,
        saveLocation,
        ...rest
    }: FieldArgs & { filenameTemplate: string; saveLocation: string }) =>
        this.addField(rest, { type: "image", filenameTemplate, saveLocation });

    addFileField = ({
        folder,
        allowedExtensions,
        ...rest
    }: FieldArgs & { folder: string; allowedExtensions: string[] }) =>
        this.addField(rest, { type: "file", folder, allowedExtensions });

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
    selectFromNotes = this.addSelectFromNotesField;
    dataview = this.addDataviewField;
    multiselect = this.addMultiselectField;
    multiselectNotes = this.addMultiselectNotesField;
    multiselectQuery = this.addMultiselectQueryField;
    document_block = this.addDocumentBlockField;
    markdown_block = this.addMarkdownBlockField;
    image = this.addImageField;
    file = this.addFileField;

    build = (): FormDefinition => {
        const fieldsValidation = validateFields(this.definition.fields);
        if (fieldsValidation.length > 0) {
            this.reporter(
                "🚧 Error building form 🚧",
                fieldsValidation.map((x) => `${x.path}: ${x.message}`).join("\n"),
            );
        }
        return this.definition;
    };
}

export const makeBuilder = (reporter: (title: string, message: string) => void) =>
    function createBuilder(name: string, title?: string, fields: FormDefinition["fields"] = []) {
        return new FormBuilder({ name, title: title || name, fields, version: "1" }, reporter);
    };
