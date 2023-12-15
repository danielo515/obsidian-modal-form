import { Output, array, literal, object, string, union } from "valibot";

const TemplateTextSchema = object({
    _tag: literal("text"),
    value: string(),
});

const TemplateVariableSchema = object({
    _tag: literal("variable"),
    value: string(),
});

export const ParsedTemplateSchema = array(union([TemplateTextSchema, TemplateVariableSchema]))

export type TemplateText = Output<typeof TemplateTextSchema>;
export type TemplateVariable = Output<typeof TemplateVariableSchema>;
