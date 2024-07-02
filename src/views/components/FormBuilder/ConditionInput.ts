import { input } from "@core";
import { absurd } from "@std";

export function buildCondition(
    conditionType: input.ConditionType,
    dependencyName: string,
    booleanValue: boolean,
    textValue: string,
    numberValue: number,
): input.Condition {
    switch (conditionType) {
        case "isSet":
            return {
                dependencyName,
                type: "isSet",
            };
        case "boolean":
            return { dependencyName, type: "boolean", value: booleanValue };
        case "startsWith":
        case "contains":
        case "endsWith":
        case "isExactly":
            return {
                dependencyName,
                type: conditionType,
                value: textValue,
            };
        case "above":
        case "below":
        case "aboveOrEqual":
        case "belowOrEqual":
        case "exactly":
            return {
                dependencyName,
                type: conditionType,
                value: numberValue,
            };
        default:
            return absurd(conditionType);
    }
}
