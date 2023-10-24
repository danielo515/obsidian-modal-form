import { parseSettings } from "./settings";
import * as E from "fp-ts/Either";

describe("parseSettings", () => {
    it("should return the default settings when given null", () => {
        const result = parseSettings(null);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) {
            expect(result.right).toEqual({
                editorPosition: "right",
                formDefinitions: [],
            });
        }
    });

    it("should return the parsed settings when given valid input", () => {
        const input = {
            editorPosition: "left",
            formDefinitions: [],
        };
        const result = parseSettings(input);
        expect(E.isRight(result)).toBe(true);
        if (E.isRight(result)) expect(result.right).toEqual(input);
    });

    it("should return a validation error when given invalid input", () => {
        const input = {
            editorPosition: "lift",
            formDefinitions: [],
        };
        const result = parseSettings(input);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) expect(result.left).toBeDefined();
    });
});
