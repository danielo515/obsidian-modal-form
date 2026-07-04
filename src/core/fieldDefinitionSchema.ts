import { array, boolean, merge, object, optional, passthrough, string, type Output } from "valibot";
import { ConditionSchema } from "./input/dependentFields";
import { InputTypeSchema, nonEmptyString } from "./input/InputDefinitionSchema";

export const FieldDefinitionSchema = object({
    name: nonEmptyString("field name"),
    label: optional(string()),
    description: string(),
    isRequired: optional(boolean()),
    condition: optional(ConditionSchema),
    input: InputTypeSchema,
});

/**
 * Only for error reporting purposes
 */
export const FieldMinimalSchema = passthrough(
    merge([FieldDefinitionSchema, object({ input: passthrough(object({ type: string() })) })]),
);

export const FieldListSchema = array(FieldDefinitionSchema);

export type FieldDefinition = Output<typeof FieldDefinitionSchema>;
export type FieldMinimal = Output<typeof FieldMinimalSchema>;
