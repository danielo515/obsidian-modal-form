import { Output, array, literal, object, string, union } from "valibot";

const TemplateTextSchema = object({
    _tag: literal("text"),
    value: string(),
});

const TemplateVariableSchema = object({
    _tag: literal("variable"),
    value: string(),
});

const FrontmatterCommandSchema = object({
    _tag: literal("frontmatter-command"),
    pick: array(string()),
    omit: array(string()),
});

export const ParsedTemplateSchema = array(union([TemplateTextSchema, TemplateVariableSchema, FrontmatterCommandSchema]))


export type TemplateText = Output<typeof TemplateTextSchema>;
export type TemplateVariable = Output<typeof TemplateVariableSchema>;

export type FrontmatterCommand = Output<typeof FrontmatterCommandSchema>;
