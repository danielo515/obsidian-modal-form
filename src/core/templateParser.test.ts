import { parseTemplate, anythingUntilOpenOrEOF } from "./templateParser";
import * as S from 'parser-ts/string'
import * as E from "fp-ts/Either";
import { pipe } from "@std";

const inspect = (val: unknown) => {
    console.dir(val, { depth: 10 });
    return val;
}
const logError = E.mapLeft(console.log);

describe("parseTemplate", () => {
    it.skip("test", () => {
        pipe(
            S.run("al{nam{{e}}")(anythingUntilOpenOrEOF),
            inspect)
    });
    it("should parse a single identifier template", () => {
        const template = "{{name}}";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of([{ _tag: "variable", value: "name" }]));

    });
    it("templates can start with an identifier", () => {
        const template = "{{name}} is a name";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of([
            { _tag: "variable", value: "name" },
            { _tag: "text", value: " is a name" },
        ]));
    });
    it("should parse a valid template", () => {
        const template = "Hello, {{name}}!";
        const result = parseTemplate(template);
        logError(result);
        expect(result).toEqual(E.of(
            [
                { _tag: "text", value: "Hello, " },
                { _tag: "variable", value: "name" },
                { _tag: "text", value: "!" },
            ],
        ));
    });
    it("should parse a valid template with several variables", () => {
        const template = "Hello, {{name}}! You are {{age}} years old.";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of(
            [
                { _tag: "text", value: "Hello, " },
                { _tag: "variable", value: "name" },
                { _tag: "text", value: "! You are " },
                { _tag: "variable", value: "age" },
                { _tag: "text", value: " years old." },
            ],
        ));
    });

    it("should allow single braces in a template", () => {
        const template = "This is code {bla}";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of(
            [
                { _tag: "text", value: "This is code {bla}" },
            ],
        ));
    })
    it("should allow single braces in a template even if it has variables", () => {
        const template = "This is code {bla} {{name}}";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of(
            [
                { _tag: "text", value: "This is code {bla} " },
                { _tag: "variable", value: "name" },
            ],
        ));
    })

    it("should return a parse error for an invalid template", () => {
        const template = "Hey, {{name}!";
        const result = parseTemplate(template);
        inspect(result);
        logError(result);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
            expect(result.left).toBeDefined();
        } else {
            fail("Expected a left value");
        }
    });

    it("should allow spaces within open and close braces", () => {
        const template = "Hey, {{ name }}!";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of(
            [
                { _tag: "text", value: "Hey, " },
                { _tag: "variable", value: "name" },
                { _tag: "text", value: "!" },
            ],
        ));
    })
});
