import { ParsingFn, parseC, trySchemas } from "@std";
import { absurd } from "fp-ts/function";
import {
    BaseSchema,
    Output,
    array,
    boolean,
    enumType,
    is,
    literal,
    minLength,
    number,
    object,
    optional,
    string,
    toTrimmed,
    union,
} from "valibot";
import { AllFieldTypes, AllSources } from "../formDefinition";

/**
 * Here are the definition for the input types.
 * This types are the ones that represent the just the input.
 * This is how they are stored in the settings/form definition.
 * For schemas of the FieldDefinition, see formDefinitionSchema.ts
 **/

export function nonEmptyString(name: string) {
    return string(`${name} should be a string`, [
        toTrimmed(),
        minLength(1, `${name} should not be empty`),
    ]);
}

const InputBasicTypeSchema = enumType([
    "text",
    "number",
    "date",
    "time",
    "datetime",
    "textarea",
    "toggle",
    "email",
    "tel",
]);

export const isBasicInputType = (type: string) => is(InputBasicTypeSchema, type);
export type BasicInputType = Output<typeof InputBasicTypeSchema>;

//=========== Schema definitions
export const SelectFromNotesSchema = object({
    type: literal("select"),
    source: literal("notes"),
    folder: nonEmptyString("folder name"),
});
export const InputTagSchema = object({
    type: literal("tag"),
    exclude: optional(string()), // This should be a regex string
});
export const InputSliderSchema = object({
    type: literal("slider"),
    min: number(),
    max: number(),
});
export const InputNoteFromFolderSchema = object({
    type: literal("note"),
    folder: nonEmptyString("folder name"),
});
export const InputFolderSchema = object({
    type: literal("folder"),
    // TODO: allow exclude option
});
export const InputDataviewSourceSchema = object({
    type: literal("dataview"),
    query: nonEmptyString("dataview query"),
});
export const InputBasicSchema = object({ type: InputBasicTypeSchema });
export const InputSelectFixedSchema = object({
    type: literal("select"),
    source: literal("fixed"),
    options: array(
        object({
            value: string([toTrimmed()]),
            label: string(),
        }),
    ),
});
const MultiSelectNotesSchema = object({
    type: literal("multiselect"),
    source: literal("notes"),
    folder: nonEmptyString("multi select source folder"),
});
const MultiSelectFixedSchema = object({
    type: literal("multiselect"),
    source: literal("fixed"),
    multi_select_options: array(string()),
    allowUnknownValues: optional(boolean(), false),
});
const MultiSelectQuerySchema = object({
    type: literal("multiselect"),
    source: literal("dataview"),
    query: nonEmptyString("dataview query"),
    allowUnknownValues: optional(boolean(), false),
});

export function canAllowUnknownValues(
    type: "multiselect",
    source: AllSources,
): source is "dataview" | "fixed" {
    return type === "multiselect" && (source === "dataview" || source === "fixed");
}

export function allowsUnknownValues(input: multiselect): boolean {
    if (input.source === "notes") return false;
    return input.allowUnknownValues;
}

export const MultiselectSchema = union([
    MultiSelectNotesSchema,
    MultiSelectFixedSchema,
    MultiSelectQuerySchema,
]);

// This is a special type of input that lets you render a string
// based on the values of other fields.
const DocumentBlock = object({
    type: literal("document_block"),
    body: string(),
});

// Codec for all the input types
export const InputTypeSchema = union([
    InputBasicSchema,
    InputNoteFromFolderSchema,
    InputFolderSchema,
    InputSliderSchema,
    InputTagSchema,
    SelectFromNotesSchema,
    InputDataviewSourceSchema,
    InputSelectFixedSchema,
    MultiselectSchema,
    DocumentBlock,
]);

export type Input = Output<typeof InputTypeSchema>;

export const InputTypeToParserMap: Record<AllFieldTypes, ParsingFn<BaseSchema>> = {
    number: parseC(InputBasicSchema),
    text: parseC(InputBasicSchema),
    email: parseC(InputBasicSchema),
    tel: parseC(InputBasicSchema),
    date: parseC(InputBasicSchema),
    time: parseC(InputBasicSchema),
    datetime: parseC(InputBasicSchema),
    textarea: parseC(InputBasicSchema),
    toggle: parseC(InputBasicSchema),
    note: parseC(InputNoteFromFolderSchema),
    folder: parseC(InputFolderSchema),
    slider: parseC(InputSliderSchema),
    tag: parseC(InputTagSchema),
    select: trySchemas([SelectFromNotesSchema, InputSelectFixedSchema]),
    dataview: parseC(InputDataviewSourceSchema),
    multiselect: parseC(MultiselectSchema),
    document_block: parseC(DocumentBlock),
};

//=========== Types derived from schemas
export type selectFromNotes = Output<typeof SelectFromNotesSchema>;
export type inputSlider = Output<typeof InputSliderSchema>;
export type inputNoteFromFolder = Output<typeof InputNoteFromFolderSchema>;
export type inputDataviewSource = Output<typeof InputDataviewSourceSchema>;
export type inputSelectFixed = Output<typeof InputSelectFixedSchema>;
export type Select = selectFromNotes | inputSelectFixed;
export type basicInput = Output<typeof InputBasicSchema>;
export type multiselect = Output<typeof MultiselectSchema>;
export type inputTag = Output<typeof InputTagSchema>;
export type inputType = Output<typeof InputTypeSchema>;

export type DocumentBlock = Output<typeof DocumentBlock>;

export function requiresListOfStrings(input: inputType): boolean {
    const type = input.type;
    switch (type) {
        case "multiselect":
        case "tag":
            return true;
        case "select":
        case "dataview":
        case "note":
        case "folder":
        case "slider":
        case "document_block":
        case "number":
        case "text":
        case "date":
        case "time":
        case "datetime":
        case "textarea":
        case "toggle":
        case "email":
        case "tel":
            return false;
        default:
            return absurd(type);
    }
}
