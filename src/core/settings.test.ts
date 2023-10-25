import { NullSettingsError, parseSettings } from "./settings";
import * as E from "fp-ts/Either";

describe("parseSettings", () => {
    it("should notify a NullSettingsError when given null", () => {
        const result = parseSettings(null);
        expect(result).toEqual(E.left(new NullSettingsError()));
    });

    it("should return the parsed settings when given valid input", () => {
        const input = {
            editorPosition: "left",
            formDefinitions: [],
        };
        const result = parseSettings(input);
        expect(result).toEqual(E.of(input));
    });

    it("should return a validation error when given invalid input", () => {
        const input = {
            editorPosition: "lift",
            formDefinitions: [],
        };
        const result = parseSettings(input);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) expect(result.left).toBeDefined()
        else fail("Expected a left value")
    });
});
