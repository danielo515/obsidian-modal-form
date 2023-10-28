import { A, E, pipe } from "@std";
import { findFieldErrors } from "./findInputDefinitionSchema";

describe("findFieldErrors", () => {
    it("should return an empty array of detailed errors or unchanged fields if they are correct", () => {
        const fields = [
            { name: 'fieldName', description: 'field description', input: { type: 'text' } },
            { name: 'fieldName', input: { type: 'text' } },
            { name: 'fieldName', description: '', input: { type: '' } },
            {},
        ];
        const errors = pipe(
            findFieldErrors(fields),
            A.map(E.mapLeft((e) => e.toString()))
        )
        expect(errors).toHaveLength(4);
        expect(errors[0]).toEqual(E.right({ name: 'fieldName', description: 'field description', input: { type: 'text' } }));
        expect(errors[1]).toEqual(E.left('InvalidFieldError: description: Invalid type got undefined'));
        expect(errors[2]).toEqual(E.left('InvalidInputTypeError: "input.type" is invalid, got: ""'));
        expect(errors[3]).toEqual(E.left('InvalidFieldError: name: field name should be a string got undefined, description: Invalid type got undefined, input: Invalid type got undefined'));
    });

});
