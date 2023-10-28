import * as E from "fp-ts/Either";
import { pipe, parse } from "@std";
import { object, number, literal, type Output, is, array, string, union, optional, minLength, toTrimmed, merge, unknown, ValiError, BaseSchema, enumType, passthrough } from "valibot";
import { AllFieldTypes, FormDefinition } from "./formDefinition";
import { findFieldErrors } from "./findInputDefinitionSchema";

/**
 * Here are the core logic around the main domain of the plugin,
 * which is the form definition.
 * Here are the types, validators, rules etc.
 */
function nonEmptyString(name: string) {
    return string(`${name} should be a string`, [toTrimmed(), minLength(1, `${name} should not be empty`)]);
}
const InputBasicTypeSchema = enumType(["text", "number", "date", "time", "datetime", "textarea", "toggle"]);
//=========== Schema definitions
export const SelectFromNotesSchema = object({ type: literal("select"), source: literal("notes"), folder: nonEmptyString('folder name') });
export const InputSliderSchema = object({ type: literal("slider"), min: number(), max: number() });
export const InputNoteFromFolderSchema = object({ type: literal("note"), folder: nonEmptyString('folder name') });
export const InputDataviewSourceSchema = object({ type: literal("dataview"), query: nonEmptyString('dataview query') });
export const InputBasicSchema = object({ type: InputBasicTypeSchema });
export const InputSelectFixedSchema = object({
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
export const InputTypeSchema = union([
    InputBasicSchema,
    InputNoteFromFolderSchema,
    InputSliderSchema,
    SelectFromNotesSchema,
    InputDataviewSourceSchema,
    InputSelectFixedSchema,
    MultiselectSchema
]);
export const InputTypeToParserMap: Record<AllFieldTypes, BaseSchema> = {
    number: InputBasicSchema,
    text: InputBasicSchema,
    date: InputBasicSchema,
    time: InputBasicSchema,
    datetime: InputBasicSchema,
    textarea: InputBasicSchema,
    toggle: InputBasicSchema,
    note: InputNoteFromFolderSchema,
    slider: InputSliderSchema,
    select: SelectFromNotesSchema,
    dataview: InputDataviewSourceSchema,
    multiselect: MultiselectSchema,
};

export const FieldDefinitionSchema = object({
    name: nonEmptyString('field name'),
    label: optional(string()),
    description: string(),
    input: InputTypeSchema
});
/**
 * Only for error reporting purposes
 */
export const FieldMinimalSchema = passthrough(merge([
    FieldDefinitionSchema,
    object({ input: object({ type: string() }) })
]));

export type FieldMinimal = Output<typeof FieldMinimalSchema>;


export const FieldListSchema = array(FieldDefinitionSchema);
/**
 * This is the most basic representation of a form definition.
 * It is not useful for anything other than being the base for
 * other versioned schemas.
 * This is the V0 schema.
 */
export const FormDefinitionBasicSchema = object({
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
export const FormDefinitionLatestSchema = FormDefinitionV1Schema;
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
            ${this.error.issues.map((issue) => issue.message).join(', ')}`;
    }
    // This allows to store the error in the settings, along with the rest of the forms and 
    // have save all the data in one go transparently.
    // This is required so we don't lose the form, even if it is invalid
    toJSON() {
        return this.form;
    }
    get fieldErrors() {
        return findFieldErrors(this.form.fields);
    }
}
/**
 * This represents totally invalid data.
 */
export class InvalidData {
    static readonly _tag = "InvalidData" as const;
    constructor(public data: unknown, readonly error: ValiError) { }
    toString(): string {
        return `InvalidData: ${this.error.issues.map((issue) => issue.message).join(', ')}`;
    }
}
//=========== Migration logic
function fromV0toV1(data: FormDefinitionBasic): MigrationError | FormDefinitionV1 {
    return pipe(
        parse(FormDefinitionV1Schema, { ...data, version: "1" }),
        E.getOrElseW((error) => (new MigrationError(data, error)))
    );
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
            E.map(fromV0toV1)
        ))
    );
}

export function formNeedsMigration(data: unknown): boolean {
    return !is(FormDefinitionLatestSchema, data);
}
