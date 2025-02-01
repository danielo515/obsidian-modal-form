import { FieldDefinition, FormDefinition, validateFields } from "./formDefinition";

type FieldArgs = { name: string; label?: string; description?: string };

export class FormBuilder {
    definition: FormDefinition;

    constructor(
        { name, fields, title, version }: FormDefinition,
        private reporter: (title: string, message: string) => void,
    ) {
        this.definition = { name, fields, title, version };
    }

    private addField = (
        { name, label, description }: FieldArgs,
        input: FormDefinition["fields"][0]["input"],
    ) => {
        const textField: FieldDefinition = {
            name,
            label,
            description: description || "",
            input,
        };
        return new FormBuilder(
            {
                ...this.definition,
                fields: [...this.definition.fields, textField],
            },
            this.reporter,
        );
    };

    addTextField = ({ name, label, description, hidden }: FieldArgs & { hidden?: boolean }) =>
        this.addField({ name, label, description }, { type: "text", hidden: Boolean(hidden) });

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
