import { E, trySchemas } from "./index";
import { string, number, array, boolean, object, ValiError } from "valibot";

describe("trySchemas", () => {
    const schema1 = object({
        name: string(),
        age: number(),
        hobbies: array(string()),
        isEmployed: boolean(),
    });

    const schema2 = object({
        firstName: string(),
        lastName: string(),
        age: number(),
        isStudent: boolean(),
    });

    const schema3 = object({
        title: string(),
        author: string(),
        year: number(),
    });

    it("should return a Right with the parsed data if it matches the first schema", () => {
        const input = {
            name: "John Doe",
            age: 30,
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };
        const result = trySchemas([schema1, schema2, schema3])(input);
        expect(result).toEqual({
            _tag: "Right",
            right: {
                name: "John Doe",
                age: 30,
                hobbies: ["reading", "swimming"],
                isEmployed: true,
            },
        });
    });

    it("should return a Right with the parsed data if it matches one of the other schemas", () => {
        const input = {
            firstName: "Jane",
            lastName: "Doe",
            age: 25,
            isStudent: true,
        };
        const result = trySchemas([schema1, schema2, schema3])(input);
        expect(result).toEqual({
            _tag: "Right",
            right: {
                firstName: "Jane",
                lastName: "Doe",
                age: 25,
                isStudent: true,
            },
        });
    });

    it("should return a Left with a ValiError if the input does not match any of the schemas", () => {
        const input = {
            name: "John Doe",
            age: "30",
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };
        const result = trySchemas([schema1, schema2, schema3])(input);
        if (E.isLeft(result)) {
            expect(result.left.message).toEqual('Invalid type');
        } else {
            fail('expected a Left')
        }
    });
});
