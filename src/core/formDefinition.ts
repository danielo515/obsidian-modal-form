import { object, number, literal, type Output, is, array, string, union, optional, safeParse, minLength, toTrimmed } from "valibot";
/**
 * Here are the core logic around the main domain of the plugin,
 * which is the form definition.
 * Here are the types, validators, rules etc.
 */

function nonEmptyString(name: string) {
    return string(`${name} should be a string`, [toTrimmed(), minLength(1, `${name} should not be empty`)])
}

const FieldTypeSchema = union([literal("text"), literal("number"), literal("date"), literal("time"), literal("datetime"), literal("textarea"), literal("toggle")]);
type FieldType = Output<typeof FieldTypeSchema>;

const fieldTypeMap: Record<FieldType, string> = {
    text: "Text",
    number: "Number",
    date: "Date",
    time: "Time",
    datetime: "DateTime",
    textarea: "Text area",
    toggle: "Toggle"
};
//=========== Schema definitions
const SelectFromNotesSchema = object({ type: literal("select"), source: literal("notes"), folder: nonEmptyString('folder name') });
const InputSliderSchema = object({ type: literal("slider"), min: number(), max: number() })
const InputNoteFromFolderSchema = object({ type: literal("note"), folder: nonEmptyString('folder name') });
const InputDataviewSourceSchema = object({ type: literal("dataview"), query: nonEmptyString('dataview query') });
const BasicInputSchema = object({ type: FieldTypeSchema });

const InputSelectFixedSchema = object({
    type: literal("select"),
    source: literal("fixed"),
    options: array(object({
        value: nonEmptyString('Value of a select option'), label: string()
    }))
});

const MultiSelectNotesSchema = object({
    type: literal("multiselect"), source: literal("notes"),
    folder: nonEmptyString('multi select source folder')
});
const MultiSelectFixedSchema = object({ type: literal("multiselect"), source: literal("fixed"), multi_select_options: array(string()) });
export const MultiselectSchema = union([MultiSelectNotesSchema, MultiSelectFixedSchema]);

//=========== Types derived from schemas
type selectFromNotes = Output<typeof SelectFromNotesSchema>;
type inputSlider = Output<typeof InputSliderSchema>;
type inputNoteFromFolder = Output<typeof InputNoteFromFolderSchema>;
type inputDataviewSource = Output<typeof InputDataviewSourceSchema>;
type inputSelectFixed = Output<typeof InputSelectFixedSchema>;
type basicInput = Output<typeof BasicInputSchema>;
type multiselect = Output<typeof MultiselectSchema>;

const InputTypeSchema = union([
    BasicInputSchema,
    InputNoteFromFolderSchema,
    InputSliderSchema,
    SelectFromNotesSchema,
    InputDataviewSourceSchema,
    InputSelectFixedSchema,
    MultiselectSchema
]);

type inputType = Output<typeof InputTypeSchema>;

export const FieldTypeReadable: Record<AllFieldTypes, string> = {
    ...fieldTypeMap,
    "note": "Note",
    "slider": "Slider",
    "select": "Select",
    "dataview": "Dataview",
    "multiselect": "Multiselect",
} as const;

function isObject(input: unknown): input is Record<string, unknown> {
    return typeof input === "object" && input !== null;
}
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

export type AllFieldTypes = inputType['type']
const FieldDefinitionSchema = object({
    name: nonEmptyString('field name'),
    label: optional(string()),
    description: string(),
    input: InputTypeSchema
});

export type FieldDefinition = Output<typeof FieldDefinitionSchema>;
const FieldListSchema = array(FieldDefinitionSchema);
/**
 * FormDefinition is an already valid form, ready to be used in the form modal.
 * @param title - The title of the form which will appear as H1 heading in the form modal.
 * @param fields - An array of field objects, each representing a field in the form.
 * Each field object has the following properties:
 * @param name - The name of the field. This will be the key name in the resulting data returned
 * @param label - optional label to show in the UI. If it does not exist, the name will be used.
 * @param description - A description of the field.
 * @param type - The type of the field. Can be one of "text", "number", "date", "time", "datetime", "toggle".
 */
export type FormDefinition = {
    title: string;
    name: string;
    fields: FieldDefinition[];
};

export type FormOptions = {
    values?: Record<string, unknown>;
}

// When an input is in edit state, it is represented by this type.
// It has all the possible values, and then you need to narrow it down
// to the actual type.
export type EditableInput = {
    type: AllFieldTypes;
    source?: "notes" | "fixed";
    folder?: string;
    min?: number;
    max?: number;
    options?: { value: string; label: string }[];
    multi_select_options?: string[];
    query?: string;
};

export type EditableFormDefinition = {
    title: string;
    name: string;
    fields: {
        name: string;
        label?: string;
        description: string;
        input: EditableInput;
    }[];
};

export function isValidBasicInput(input: unknown): input is basicInput {
    return is(BasicInputSchema, input);
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
        return []
    }
    console.error('Fields issues', result.issues)
    return result.issues.map(issue =>
    ({
        message: issue.message, path: issue.path?.map(item => item.key).join('.'),
        index: issue.path?.[0]?.key ?? 0
    })
    );
}

export function isValidFormDefinition(input: unknown): input is FormDefinition {
    if (!isObject(input)) {
        return false;
    }
    if (typeof input.title !== "string") {
        return false;
    }
    if (typeof input.name !== "string" || input.name === '') {
        return false;
    }
    console.log('basic is valid');
    const fieldsAreValid = is(FieldListSchema, input.fields);
    if (!fieldsAreValid) {
        return false;
    }
    console.log('fields are valid');
    return true;
}
