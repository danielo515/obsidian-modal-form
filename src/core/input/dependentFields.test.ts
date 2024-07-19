import { input } from "@core";
import * as v from "valibot";
import type { FieldDefinition } from "../formDefinition";
import * as deps from "./dependentFields";
import { ConditionSchema } from "./dependentFields";

describe("dependentFields", () => {
    it("should return a list of conditions available for the input type: 'text'", () => {
        const field: FieldDefinition["input"] = {
            type: "text",
        };
        const types = input.availableConditionsForInput(field);
        types.forEach((type) => {
            const value = { type, dependencyName: "test-field", value: "test" };
            const parsed = v.safeParse(ConditionSchema, value);
            expect(parsed.success).toBe(true);
        });
        expect.assertions(types.length);
    });
    it("should return true if the value is set", () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, "test")).toBe(true);
        expect(deps.valueMeetsCondition(condition, 0)).toBe(true);
        expect(deps.valueMeetsCondition(condition, true)).toBe(true);
        expect(deps.valueMeetsCondition(condition, false)).toBe(true);
    });
    it("should return false if the value is not set", () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, "")).toBe(false);
    });
    it("should handle the boolean condition", () => {
        const condition: input.Condition = {
            type: "boolean",
            value: true,
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, true)).toBe(true);
        expect(deps.valueMeetsCondition(condition, false)).toBe(false);
    });
    it('should handle the isSet conditions for "null" and "undefined"', () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, null)).toBe(false);
        expect(deps.valueMeetsCondition(condition, undefined)).toBe(false);
        expect(deps.valueMeetsCondition(condition, "")).toBe(false);
    });
    it("should properly handle all string conditions that are true", () => {
        const conditions: [input.Condition, string][] = [
            [{ type: "startsWith", dependencyName: "test-field", value: "test" }, "test starts"],
            [{ type: "endsWith", dependencyName: "test-field", value: "test" }, "ends with test"],
            [{ type: "isExactly", dependencyName: "test-field", value: "test" }, "test"],
            [
                { type: "contains", dependencyName: "test-field", value: "test" },
                "contains test somewhere",
            ],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(true);
        });
        expect.assertions(conditions.length);
    });
    it("should properly handle all string conditions that are false", () => {
        const conditions: [input.Condition, unknown][] = [
            [{ type: "startsWith", dependencyName: "test-field", value: "test" }, "not test"],
            [{ type: "startsWith", dependencyName: "test-field", value: "test" }, null],
            [
                { type: "endsWith", dependencyName: "test-field", value: "test" },
                "not test at the end",
            ],
            [
                { type: "isExactly", dependencyName: "test-field", value: "test" },
                "not exactly test",
            ],
            [
                { type: "contains", dependencyName: "test-field", value: "test" },
                "does not contain tst",
            ],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(false);
        });
        expect.assertions(conditions.length);
    });
    it("should properly handle all number conditions that are true", () => {
        const conditions: [input.Condition, unknown][] = [
            [{ type: "above", dependencyName: "test", value: 5 }, 6],
            [{ type: "aboveOrEqual", dependencyName: "test", value: 5 }, 5],
            [{ type: "aboveOrEqual", dependencyName: "test", value: 5 }, 8],
            [{ type: "below", dependencyName: "test", value: 5 }, 4],
            [{ type: "below", dependencyName: "test", value: 5 }, -4],
            [{ type: "belowOrEqual", dependencyName: "test", value: 5 }, 5],
            [{ type: "belowOrEqual", dependencyName: "test", value: 5 }, 2],
            [{ type: "exactly", dependencyName: "test", value: 5 }, 5],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(true);
        });
        expect.assertions(conditions.length);
    });
    it("should properly handle all number conditions that are false", () => {
        const conditions: [input.Condition, unknown][] = [
            [{ type: "above", dependencyName: "test", value: 5 }, 4],
            [{ type: "aboveOrEqual", dependencyName: "test", value: 5 }, 4],
            [{ type: "below", dependencyName: "test", value: 5 }, 6],
            [{ type: "belowOrEqual", dependencyName: "test", value: 5 }, 6],
            [{ type: "exactly", dependencyName: "test", value: 5 }, 4],
            [{ type: "exactly", dependencyName: "test", value: 5 }, null],
            [{ type: "exactly", dependencyName: "test", value: 5 }, undefined],
            [{ type: "exactly", dependencyName: "test", value: 5 }, {}],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(false);
        });
        expect.assertions(conditions.length);
    });
});
