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
export const ConditionSchema = v.union([isSet, booleanValue, startsWith, above, below]);

export type Condition = v.Output<typeof ConditionSchema>;
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

function processIsSet(_condition: Extract<Condition, { type: "isSet" }>, value: unknown) {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === "string") {
        return value !== "";
    }
    return true;
}

function processStringCondition(
    condition: Extract<Condition, { type: "startsWith" | "contains" }>,
    value: unknown,
): boolean {
    if (typeof value !== "string") {
        return false;
    }
    switch (condition.type) {
        case "startsWith":
            return value.startsWith(condition.value);
        case "contains":
            return value.includes(condition.value);
        default:
            return absurd(condition.type);
    }
}

function processNumberCondition(
    condition: Extract<Condition, { type: "above" | "below" }>,
    value: unknown,
): boolean {
    if (typeof value !== "number") {
        return false;
    }
    switch (condition.type) {
        case "above":
            return value > condition.value;
        case "below":
            return value < condition.value;
        default:
            return absurd(condition);
    }
}

export function valueMeetsCondition(condition: Condition, value: unknown): boolean {
    if (value === null || value === undefined) {
        return false;
    }
    switch (condition.type) {
        case "isSet":
            console.log({ ...condition, value });
            return processIsSet(condition, value);
        case "startsWith":
        case "contains":
            return processStringCondition(condition, value);
        case "above":
        case "below":
            return processNumberCondition(condition, value);
        case "boolean":
            return value === condition.value;
        default:
            return absurd(condition);
    }
}
