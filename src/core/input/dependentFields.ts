import { absurd } from "fp-ts/function";
import * as v from "valibot";
import { FieldDefinition } from "../formDefinition";
const isSet = v.object({ field: v.string(), type: v.literal("isSet") });
const booleanValue = v.object({
    field: v.string(),
    type: v.literal("boolean"),
    value: v.boolean(),
});
const startsWith = v.object({
    field: v.string(),
    type: v.enumType(["startsWith", "contains"]),
    value: v.string(),
});
const above = v.object({ field: v.string(), type: v.literal("above"), value: v.number() });
const below = v.object({ field: v.string(), type: v.literal("below"), value: v.number() });
const condition = v.union([isSet, booleanValue, startsWith, above, below]);

export type Condition = v.Output<typeof condition>;
export type ConditionType = Condition["type"];

export function availableConditionsForInput(input: FieldDefinition["input"]): ConditionType[] {
    switch (input.type) {
        case "text":
        case "textarea":
        case "email":
        case "folder":
        case "note":
        case "tel":
            return ["isSet", "startsWith", "contains"];
        case "slider":
        case "number":
            return ["isSet", "above", "below"];
        case "toggle":
            return ["boolean"];
        case "date":
        case "time":
        case "datetime":
            return ["isSet"];
        case "select":
        case "multiselect":
        case "tag":
        case "dataview":
        case "document_block":
            return [];
        default:
            return absurd(input);
    }
}
