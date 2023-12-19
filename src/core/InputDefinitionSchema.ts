import { trySchemas, ParsingFn, parseC } from "@std";
import { AllFieldTypes } from "./formDefinition";
import {
    object,
    number,
    literal,
    array,
    string,
    union,
    optional,
    minLength,
    toTrimmed,
    BaseSchema,
    enumType,
    Output,
} from "valibot";

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
});
const MultiSelectQuerySchema = object({
    type: literal("multiselect"),
    source: literal("dataview"),
    query: nonEmptyString("dataview query"),
});
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

export const InputTypeToParserMap: Record<
    AllFieldTypes,
    ParsingFn<BaseSchema>
> = {
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
export type basicInput = Output<typeof InputBasicSchema>;
export type multiselect = Output<typeof MultiselectSchema>;
export type inputType = Output<typeof InputTypeSchema>;
