import { E } from "@std";
import { TemplateError } from "./TemplateError";
import { describeTemplateError, renderTemplate } from "./renderTemplate";
import { parseTemplate } from "./templateParser";

function parse(template: string) {
    const parsed = parseTemplate(template);
    if (E.isLeft(parsed)) throw new Error(`Bad test template: ${parsed.left}`);
    return parsed.right;
}

describe("renderTemplate", () => {
    it("renders a template like executeTemplate does", () => {
        expect(renderTemplate(parse("Hello {{name}}"), { name: "world" })).toEqual(
            E.right("Hello world"),
        );
    });

    it("turns a rendering blow up into a TemplateError instead of losing the data", () => {
        const exploding = [
            {
                _tag: "variable" as const,
                value: "name",
                transformation: "upper" as const,
            },
        ];
        const data = {
            get name(): string {
                throw new Error("kaboom");
            },
        };
        const result = renderTemplate(exploding, data);
        expect(E.isLeft(result)).toBe(true);
        if (E.isLeft(result)) {
            expect(result.left).toBeInstanceOf(TemplateError);
            expect(describeTemplateError(result.left)).toContain("kaboom");
        }
    });
});

describe("describeTemplateError", () => {
    it("unwraps the cause so the user sees what actually failed", () => {
        const error = TemplateError.of("Error creating note from template")(
            new Error("Templater parsing error: Unexpected token"),
        );
        expect(describeTemplateError(error)).toBe(
            "Error creating note from template: Templater parsing error: Unexpected token",
        );
    });

    it("does not repeat the same message twice", () => {
        const original = new Error("boom");
        expect(describeTemplateError(TemplateError.of("boom")(original))).toBe("boom");
    });

    it("handles plain errors, strings and unknown values", () => {
        expect(describeTemplateError(new Error("plain"))).toBe("plain");
        expect(describeTemplateError("just a string")).toBe("just a string");
        expect(describeTemplateError(42)).toBe("42");
        expect(describeTemplateError(undefined)).toBe("Unknown error");
        expect(describeTemplateError({})).toBe("Unknown error");
    });

    it("does not loop forever on a self referencing cause", () => {
        const error: Error & { cause?: unknown } = new Error("outer");
        error.cause = error;
        expect(describeTemplateError(error)).toBe("outer");
    });
});
