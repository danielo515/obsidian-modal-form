import { type Output, is, safeParse } from "valibot";
import {
    FieldDefinitionSchema,
    FormDefinitionLatestSchema,
    FieldListSchema,
    FormDefinitionBasicSchema,
    MigrationError,
} from "./formDefinitionSchema";
import { A, O, pipe } from "@std";
import { Simplify } from "type-fest";
import {
    InputBasicSchema,
    InputDataviewSourceSchema,
    InputNoteFromFolderSchema,
    InputSelectFixedSchema,
    InputSliderSchema,
    InputTypeSchema,
    MultiselectSchema,
    SelectFromNotesSchema,
    basicInput,
    inputDataviewSource,
    inputNoteFromFolder,
    inputSelectFixed,
    inputSlider,
    inputType,
    multiselect,
    selectFromNotes,
} from "./InputDefinitionSchema";

export const InputTypeReadable: Record<AllFieldTypes, string> = {
    text: "Text",
    number: "Number",
    tag: "Tags",
    email: "Email",
    tel: "Phone",
    date: "Date",
    time: "Time",
    datetime: "DateTime",
    textarea: "Text area",
    toggle: "Toggle",
    note: "Note",
    folder: "Folder",
    slider: "Slider",
    select: "Select",
    dataview: "Dataview",
    multiselect: "Multiselect",
    document_block: "Document block",
} as const;

export function isDataViewSource(input: unknown): input is inputDataviewSource {
    return is(InputDataviewSourceSchema, input);
}

export function isInputSlider(input: unknown): input is inputSlider {
    return is(InputSliderSchema, input);
}
export function isSelectFromNotes(input: unknown): input is selectFromNotes {
    return is(SelectFromNotesSchema, input);
}

export function isInputNoteFromFolder(input: unknown): input is inputNoteFromFolder {
    return is(InputNoteFromFolderSchema, input);
}
export function isInputSelectFixed(input: unknown): input is inputSelectFixed {
    return is(InputSelectFixedSchema, input);
}

export type AllFieldTypes = inputType["type"];

export type FieldDefinition = Output<typeof FieldDefinitionSchema>;
/**
 * FormDefinition is an already valid form, ready to be used in the form modal.
 */
export type FormDefinition = Output<typeof FormDefinitionLatestSchema>;
export type FormWithTemplate = Simplify<
    FormDefinition & Required<Pick<FormDefinition, "template">>
>;

export type FormOptions = {
    values?: Record<string, unknown>;
};

type KeyOfUnion<T> = T extends unknown ? keyof T : never;
type PickUnion<T, K extends KeyOfUnion<T>> = T extends unknown
    ? K & keyof T extends never
        ? never
        : Pick<T, K & keyof T>
    : never;

export type AllSources = PickUnion<inputType, "source">["source"];

// When an input is in edit state, it is represented by this type.
// It has all the possible values, and then you need to narrow it down
// to the actual type.
export type EditableInput = {
    type: AllFieldTypes;
    source?: AllSources;
    folder?: string;
    min?: number;
    max?: number;
    options?: { value: string; label: string }[];
    multi_select_options?: string[];
    query?: string;
    allowUnknownValues?: boolean;
};

export type EditableFormDefinition = FormDefinition & {
    title: string;
    name: string;
    fields: {
        name: string;
        label?: string;
        description: string;
        input: EditableInput;
        folder?: string;
        options?: { value: string; label: string }[];
    }[];
};

export function isValidBasicInput(input: unknown): input is basicInput {
    return is(InputBasicSchema, input);
}

export function isMultiSelect(input: unknown): input is multiselect {
    return is(MultiselectSchema, input);
}

export function isInputTypeValid(input: unknown): input is inputType {
    return is(InputTypeSchema, input);
}

export function validateFields(fields: unknown) {
    const result = safeParse(FieldListSchema, fields);

    if (result.success) {
        return [];
    }
    console.error("Fields issues", result.issues);
    return result.issues.map((issue) => ({
        message: issue.message,
        path: issue.path?.map((item) => item.key).join("."),
        index: issue.path?.[0]?.key ?? 0,
    }));
}

export function isValidFormDefinition(input: unknown): input is FormDefinition {
    if (!is(FormDefinitionBasicSchema, input)) {
        return false;
    }
    // console.log("basic is valid");
    const fieldsAreValid = is(FieldListSchema, input.fields);
    if (!fieldsAreValid) {
        return false;
    }
    // console.log("fields are valid");
    return true;
}

export function duplicateForm(formName: string, forms: (FormDefinition | MigrationError)[]) {
    return pipe(
        forms,
        A.findFirstMap((f) => {
            if (f instanceof MigrationError) {
                return O.none;
            }
            if (f.name === formName) {
                return O.some(f);
            }
            return O.none;
        }),
        O.map((f) => {
            let newName = f.name + "-copy";
            let i = 1;
            while (forms.some((f) => f.name === newName)) {
                newName = f.name + "-copy-" + i;
                i++;
            }
            return { ...f, name: newName };
        }),
        O.map((f) => {
            return [...forms, f];
        }),
        O.getOrElse(() => forms),
    );
}
