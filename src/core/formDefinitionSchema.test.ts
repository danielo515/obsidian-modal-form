import { A, pipe } from "@std";
import { findFieldErrors } from "./findInputDefinitionSchema";
import { separated } from "fp-ts";

describe("findFieldErrors", () => {
    it("should return an empty array of detailed errors or unchanged fields if they are correct", () => {
        const fields = [
            { name: "fieldName", description: "field description", input: { type: "text" } },
            { name: "fieldName", input: { type: "text" } },
            { name: "fieldName", description: "", input: { type: "" } },
            {},
        ];
        const result = pipe(
            // multi line prettier
            findFieldErrors(fields),
            separated.mapLeft(A.map((e) => e.toString())),
        );
        expect(result.left).toHaveLength(3);
        expect(result.right).toHaveLength(1);
        expect(result.right[0]).toEqual({
            name: "fieldName",
            description: "field description",
            input: { type: "text" },
        });
        expect(result.left[0]).toEqual(
            "InvalidFieldError: description: Invalid type got undefined",
        );
        expect(result.left[1]).toEqual('InvalidInputTypeError: "input.type" is invalid, got: ""');
        expect(result.left[2]).toEqual(
            "InvalidFieldError: name: field name should be a string got undefined, description: Invalid type got undefined, input: Invalid type got undefined",
        );
    });
});
