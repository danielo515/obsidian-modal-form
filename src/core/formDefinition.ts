import { parse, pipe } from "@std";
import * as E from "fp-ts/Either";
import { object, number, literal, type Output, is, array, string, union, optional, safeParse, minLength, toTrimmed, merge, unknown, ValiError } from "valibot";
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
        value: string([toTrimmed()]), label: string()
    }))
});

const MultiSelectNotesSchema = object({
    type: literal("multiselect"), source: literal("notes"),
    folder: nonEmptyString('multi select source folder')
});
const MultiSelectFixedSchema = object({ type: literal("multiselect"), source: literal("fixed"), multi_select_options: array(string()) });
export const MultiselectSchema = union([MultiSelectNotesSchema, MultiSelectFixedSchema]);

const InputTypeSchema = union([
    BasicInputSchema,
    InputNoteFromFolderSchema,
    InputSliderSchema,
    SelectFromNotesSchema,
    InputDataviewSourceSchema,
    InputSelectFixedSchema,
    MultiselectSchema
]);

const FieldDefinitionSchema = object({
    name: nonEmptyString('field name'),
    label: optional(string()),
    description: string(),
    input: InputTypeSchema
});

const FieldListSchema = array(FieldDefinitionSchema);

/**
 * This is the most basic representation of a form definition.
 * It is not useful for anything other than being the base for
 * other versioned schemas.
 * This is the V0 schema.
 */
const FormDefinitionBasicSchema = object({
    title: nonEmptyString('form title'),
    name: nonEmptyString('form name'),
    fields: array(unknown()),
});

/**
 * This is the V1 schema.
 */
const FormDefinitionV1Schema = merge([FormDefinitionBasicSchema, object({
    version: literal("1"),
    fields: FieldListSchema,
})]);

// This is the latest schema.
// Make sure to update this when you add a new version.
const FormDefinitionLatestSchema = FormDefinitionV1Schema;

type FormDefinitionV1 = Output<typeof FormDefinitionV1Schema>;
type FormDefinitionBasic = Output<typeof FormDefinitionBasicSchema>;

/**
 * This means the basic structure of the form is valid
 * but we were unable to perform an automatic migration
 * and we need the user to fix the form manually.
 */
export class MigrationError {
    static readonly _tag = "MigrationError" as const;
    public readonly name: string;
    constructor(public form: FormDefinitionBasic, readonly error: ValiError) {
        this.name = form.name;
    }
    toString(): string {
        return `MigrationError: 
            ${this.error.message}
            ${this.error.issues.map((issue) => issue.message).join(', ')}`
    }
    toJSON() {
        return this.form
    }
}

/**
 * This represents totally invalid data.
 */
export class InvalidData {
    static readonly _tag = "InvalidData" as const;
    constructor(public data: unknown, readonly error: ValiError) { }
    toString(): string {
        return `InvalidData: ${this.error.issues.map((issue) => issue.message).join(', ')}`
    }
}

//=========== Migration logic
function fromV0toV1(data: FormDefinitionBasic): MigrationError | FormDefinitionV1 {
    return pipe(
        parse(FormDefinitionV1Schema, { ...data, version: "1" }),
        E.getOrElseW((error) => (new MigrationError(data, error)))
    )
}

/**
 * 
 * Parses the form definition and migrates it to the latest version in one operation.
 */
export function migrateToLatest(data: unknown): E.Either<InvalidData, MigrationError | FormDefinition> {
    return pipe(
        // first try a quick one with the latest schema
        parse(FormDefinitionLatestSchema, data, { abortEarly: true }),
        E.orElse(() => pipe(
            parse(FormDefinitionBasicSchema, data),
            E.mapLeft((error) => new InvalidData(data, error)),
            E.map(fromV0toV1),
        )),
    )
}

export function formNeedsMigration(data: unknown): boolean {
    return !is(FormDefinitionLatestSchema, data);
}

//=========== Types derived from schemas
type selectFromNotes = Output<typeof SelectFromNotesSchema>;
type inputSlider = Output<typeof InputSliderSchema>;
type inputNoteFromFolder = Output<typeof InputNoteFromFolderSchema>;
type inputDataviewSource = Output<typeof InputDataviewSourceSchema>;
type inputSelectFixed = Output<typeof InputSelectFixedSchema>;
type basicInput = Output<typeof BasicInputSchema>;
type multiselect = Output<typeof MultiselectSchema>;
type inputType = Output<typeof InputTypeSchema>;

export const FieldTypeReadable: Record<AllFieldTypes, string> = {
    ...fieldTypeMap,
    "note": "Note",
    "slider": "Slider",
    "select": "Select",
    "dataview": "Dataview",
    "multiselect": "Multiselect",
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

export type AllFieldTypes = inputType['type']

export type FieldDefinition = Output<typeof FieldDefinitionSchema>;
/**
 * FormDefinition is an already valid form, ready to be used in the form modal.
 */
export type FormDefinition = Output<typeof FormDefinitionLatestSchema>;

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
    return result.issues.map((issue) =>
    ({
        message: issue.message, path: issue.path?.map((item) => item.key).join('.'),
        index: issue.path?.[0]?.key ?? 0
    })
    );
}

export function isValidFormDefinition(input: unknown): input is FormDefinition {
    if (!is(FormDefinitionBasicSchema, input)) {
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
