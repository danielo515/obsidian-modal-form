import { right } from "fp-ts/Separated";
import { E, parseFunctionBody, pipe, trySchemas } from "./index";
import { string, number, array, boolean, object } from "valibot";

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
        console.log(" ====== 1 =====");
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
        console.log(" ====== 2 =====");
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
            age: "30", // This is a string, not a number, will fail, is what I want
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };
        console.log(" ====== 3 =====");
        const result = trySchemas([schema1, schema2, schema3])(input);
        if (E.isLeft(result)) {
            expect(result.left.message).toEqual("Invalid type");
        } else {
            fail("expected a Left");
        }
    });

    it("What if I only provide one schema and an input that matches?", () => {
        const input = {
            name: "John Doe",
            age: 30,
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };
        console.log(" ====== 4 =====");
        const result = trySchemas([schema1])(input);
        expect(result).toEqual(E.right(input));
    });

    it("What if I only provide one schema and an input that fails?", () => {
        const input = {
            name: "John Doe",
            age: "30",
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };
        const result = trySchemas([schema1])(input);
        pipe(
            result,
            E.bimap(
                (x) => expect(x.message).toEqual("Invalid type"),
                () => fail("expected a Left"),
            ),
        );
    });
});

describe("parseFunctionBody", () => {
    it("should parse a function body", () => {
        const input = "return x + 1;";
        const result = parseFunctionBody(input);
        pipe(
            result,
            E.match(
                (err) => fail("Expected a right"),
                (result) => expect(result).toBeInstanceOf(Function),
            ),
        );
    });
    it("should fail to parse a function body when it is incorrect", () => {
        const input = "{ return x + 1; ";
        const result = parseFunctionBody(input);
        expect(result).toEqual(E.left(new SyntaxError("Unexpected token ')'")));
    });
    it("should parse a function body with arguments and be able to execute it", () => {
        const input = "return x + 1;";
        const result = parseFunctionBody<[number], number>(input, "x");
        pipe(
            result,
            E.match(
                () => fail("Expected a right"),
                (result) => {
                    expect(result(1)).toEqual(E.right(2));
                },
            ),
        );
    });
});
