import {
    Output,
    array,
    enumType,
    literal,
    object,
    optional,
    string,
    transform,
    union,
} from "valibot";

const TemplateTextSchema = object({
    _tag: literal("text"),
    value: string(),
});

const upper = transform(enumType(["upper", "uppercase"]), (_) => "upper" as const);

export const transformations = union([
    upper,
    literal("lower"),
    literal("trim"),
    literal("stringify"),
]);

export type Transformations = Output<typeof transformations>;

const TemplateVariableSchema = object({
    _tag: literal("variable"),
    value: string(),
    transformation: optional(transformations),
});

const FrontmatterCommandSchema = object({
    _tag: literal("frontmatter-command"),
    pick: array(string()),
    omit: array(string()),
});

export const ParsedTemplateSchema = array(
    union([TemplateTextSchema, TemplateVariableSchema, FrontmatterCommandSchema]),
);

export type TemplateText = Output<typeof TemplateTextSchema>;
export type TemplateVariable = Output<typeof TemplateVariableSchema>;

export type FrontmatterCommand = Output<typeof FrontmatterCommandSchema>;
