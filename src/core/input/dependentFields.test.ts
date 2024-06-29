import { input } from "@core";
import { FieldDefinition } from "../formDefinition";

describe("dependentFields", () => {
    it("should return a list of conditions available for the input type: 'text'", () => {
        const field: FieldDefinition["input"] = {
            type: "text",
        };
        const result = input.availableConditionsForInput(field);
        expect(result).toEqual(["isSet", "startsWith", "contains"]);
    });
});
