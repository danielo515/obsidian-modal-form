import { pipe, tap } from "@std";
import * as E from "fp-ts/Either";
import { stringifyYaml } from "obsidian";
import * as S from "parser-ts/string";
import { FileProxy } from "../files/FileProxy";
import { anythingUntilOpenOrEOF, executeTemplate, parseTemplate } from "./templateParser";

const inspect = (val: unknown) => {
    console.dir(val, { depth: 10 });
    return val;
};
const logError = E.mapLeft(console.log);

describe("parseTemplate", () => {
    it.skip("test", () => {
        pipe(
            // stupid prettier
            S.run("al{nam{{e}}")(anythingUntilOpenOrEOF),
            inspect,
        );
    });
    it("should parse a single identifier template", () => {
        const template = "{{name}}";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of([{ _tag: "variable", value: "name" }]));
    });
    it("templates can start with an identifier", () => {
        const template = "{{name}} is a name";
        const result = parseTemplate(template);
        expect(result).toEqual(
            E.of([
                { _tag: "variable", value: "name" },
                { _tag: "text", value: " is a name" },
            ]),
        );
    });
    it("should parse a valid template", () => {
        const template = "Hello, {{name}}!";
        const result = parseTemplate(template);
        logError(result);
        expect(result).toEqual(
            E.of([
                { _tag: "text", value: "Hello, " },
                { _tag: "variable", value: "name" },
                { _tag: "text", value: "!" },
            ]),
        );
    });
    it("should parse a valid template with several variables", () => {
        const template = "Hello, {{name}}! You are {{age}} years old.";
        const result = parseTemplate(template);
        logError(result);
        expect(result).toEqual(
            E.of([
                { _tag: "text", value: "Hello, " },
                { _tag: "variable", value: "name" },
                { _tag: "text", value: "! You are " },
                { _tag: "variable", value: "age" },
                { _tag: "text", value: " years old." },
            ]),
        );
    });

    it("should parse a variables with transformations", () => {
        const template = "Hello, {{name|uppercase}}! You are {{age|stringify}} years old.";
        const result = parseTemplate(template);
        logError(result);
        expect(result).toEqual(
            E.of([
                { _tag: "text", value: "Hello, " },
                { _tag: "variable", value: "name", transformation: "upper" },
                { _tag: "text", value: "! You are " },
                { _tag: "variable", value: "age", transformation: "stringify" },
                { _tag: "text", value: " years old." },
            ]),
        );
    });

    it("should silently ignore invalid transformations", () => {
        const template = "Hello, {{name|invalid}}! You are {{age|stringify}} years old.";
        const result = parseTemplate(template);
        logError(result);
        expect(result).toEqual(
            E.of([
                { _tag: "text", value: "Hello, " },
                { _tag: "variable", value: "name" },
                { _tag: "text", value: "! You are " },
                { _tag: "variable", value: "age", transformation: "stringify" },
                { _tag: "text", value: " years old." },
            ]),
        );
    });

    it("should allow single braces in a template", () => {
        const template = "This is code {bla}";
        const result = parseTemplate(template);
        logError(result);
        expect(result).toEqual(E.of([{ _tag: "text", value: "This is code {bla}" }]));
    });
    it("should allow single braces in a template even if it has variables", () => {
        const template = "This is code {bla} {{name}}";
        const result = parseTemplate(template);
        logError(result);
        expect(result).toEqual(
            E.of([
                { _tag: "text", value: "This is code {bla} " },
                { _tag: "variable", value: "name" },
            ]),
        );
    });

    it.skip("should return a parse error for an invalid template", () => {
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
        logError(result);
        expect(result).toEqual(
            E.of([
                { _tag: "text", value: "Hey, " },
                { _tag: "variable", value: "name" },
                { _tag: "text", value: "!" },
            ]),
        );
    });

    it("should properly execute a template with transformations", () => {
        const template = "Hello, {{name|upper}}! You are {{age|stringify}} years old.";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of("Hello, JOHN! You are 18 years old."));
    });

    it("Should execute a template with lowercase transformations", () => {
        const template = "Hello, {{name|lower}}! You are {{age}} years old.";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of("Hello, john! You are 18 years old."));
    });

    it("Should execute a template with trim transformations", () => {
        const template = "Hello, {{name|trim}}!";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: " John ", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of("Hello, John!"));
    });

    it("Should execute a template with stringify transformations", () => {
        const template = "Hello, {{name|stringify}}!";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of('Hello, "John"!'));
    });

    it("Spaces around transformations should be ignored", () => {
        const template = "Hello, {{name | stringify }}!";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of('Hello, "John"!'));
    });

    it("Spaces around transformations AND variables should be ignored", () => {
        const template = "Hello, {{ name | stringify }}!";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of('Hello, "John"!'));
    });

    it("Should execute a template with no transformations", () => {
        const template = "Hello, {{name}}! You are {{age}} years old.";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of("Hello, John! You are 18 years old."));
    });

    it("Should execute a template with capitalize transformation", () => {
        const template = "Hello, {{name|capitalize}}!";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { name: "john", age: 18 }),
            ),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of("Hello, John!"));
    });

    it("capitalize should leave the rest of the string untouched", () => {
        const template = "{{name|capitalize}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { name: "jOHN doe" }),
            ),
        );
        expect(result).toEqual(E.of("JOHN doe"));
    });

    it("capitalize should handle an empty string without crashing", () => {
        const template = "[{{name|capitalize}}]";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "" })),
        );
        expect(result).toEqual(E.of("[]"));
    });

    it("Should execute a template with slug transformation", () => {
        const template = "{{title|slug}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { title: "Hello, World!" }),
            ),
        );
        expect(result).toEqual(E.of("hello-world"));
    });

    it("slug collapses runs of dashes and trims edges", () => {
        const template = "{{title|slug}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { title: "  ---My Note (2024)  " }),
            ),
        );
        expect(result).toEqual(E.of("my-note-2024"));
    });

    it("slug preserves unicode letters and numbers", () => {
        const template = "{{title|slug}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { title: "Café Noël 2024" }),
            ),
        );
        expect(result).toEqual(E.of("café-noël-2024"));
    });

    it("slug handles an empty string without crashing", () => {
        const template = "[{{title|slug}}]";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { title: "" })),
        );
        expect(result).toEqual(E.of("[]"));
    });

    it("slug applied to an array slugifies each element and joins with commas", () => {
        // Regression: stringifying the array first would drop the commas as
        // punctuation and merge distinct values into one token.
        const template = "{{tags|slug}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { tags: ["Foo Bar", "Hello World!"] }),
            ),
        );
        expect(result).toEqual(E.of("foo-bar,hello-world"));
    });

    it("slug applied to a FileProxy uses the file name, not the full path", () => {
        // Regression: `String(fileProxy)` returns the full path so a `/` between
        // folder and file would be stripped, merging folder + name into one token.
        const file = new FileProxy({
            path: "attachments/My Photo.png",
            name: "My Photo.png",
            basename: "My Photo",
            extension: "png",
        });
        const template = "{{image|slug}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { image: file })),
        );
        expect(result).toEqual(E.of("my-photopng"));
    });

    it("Should execute a template with snake transformation", () => {
        const template = "{{title|snake}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { title: "Hello, World!" }),
            ),
        );
        expect(result).toEqual(E.of("hello_world"));
    });

    it("snake turns whitespace and dashes into underscores", () => {
        const template = "{{title|snake}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { title: "  ---My Note (2024)  " }),
            ),
        );
        expect(result).toEqual(E.of("my_note_2024"));
    });

    it("snake collapses runs of underscores and trims edges", () => {
        const template = "{{title|snake}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { title: "__foo___bar__" }),
            ),
        );
        expect(result).toEqual(E.of("foo_bar"));
    });

    it("snake preserves unicode letters and numbers", () => {
        const template = "{{title|snake}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { title: "Café Noël 2024" }),
            ),
        );
        expect(result).toEqual(E.of("café_noël_2024"));
    });

    it("snake handles an empty string without crashing", () => {
        const template = "[{{title|snake}}]";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { title: "" })),
        );
        expect(result).toEqual(E.of("[]"));
    });

    it("snake applied to an array converts each element and joins with commas", () => {
        const template = "{{tags|snake}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { tags: ["Foo Bar", "Hello World!"] }),
            ),
        );
        expect(result).toEqual(E.of("foo_bar,hello_world"));
    });

    it("snake applied to a FileProxy uses the file name, not the full path", () => {
        const file = new FileProxy({
            path: "attachments/My Photo.png",
            name: "My Photo.png",
            basename: "My Photo",
            extension: "png",
        });
        const template = "{{image|snake}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { image: file })),
        );
        expect(result).toEqual(E.of("my_photopng"));
    });

    it("Should execute a template with link transformation for a string", () => {
        const template = "See {{person|link}} for details.";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { person: "Alice" })),
        );
        expect(result).toEqual(E.of("See [[Alice]] for details."));
    });

    it("link applied to an array wraps each item and joins with commas", () => {
        const template = "{{people|link}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) =>
                executeTemplate(parsedTemplate, { people: ["Alice", "Bob"] }),
            ),
        );
        expect(result).toEqual(E.of("[[Alice]], [[Bob]]"));
    });

    it("link applied to a FileProxy renders as an embedded link using the full path", () => {
        const file = new FileProxy({
            path: "attachments/My Photo.png",
            name: "My Photo.png",
            basename: "My Photo",
            extension: "png",
        });
        const template = "{{image|link}}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { image: file })),
        );
        expect(result).toEqual(E.of("![[attachments/My Photo.png]]"));
    });

    it("link renders an empty string for numbers so `[[42]]` never appears", () => {
        const template = "[{{age|link}}]";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { age: 42 })),
        );
        expect(result).toEqual(E.of("[]"));
    });

    it("link renders an empty string for booleans so `[[true]]` never appears", () => {
        const template = "[{{active|link}}]";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { active: true })),
        );
        expect(result).toEqual(E.of("[]"));
    });

    it("should parse a frontmatter command", () => {
        const template = "{#frontmatter#}";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of([{ _tag: "frontmatter-command", pick: [], omit: [] }]));
    });

    it("should parse a frontmatter command that includes spaces", () => {
        const template = "{# frontmatter #}";
        const result = parseTemplate(template);
        expect(result).toEqual(E.of([{ _tag: "frontmatter-command", pick: [], omit: [] }]));
    });
    it("should parse a frontmatter command with pick values", () => {
        const template = "{# frontmatter pick: name,age #}";
        const result = parseTemplate(template);
        expect(result).toEqual(
            E.of([{ _tag: "frontmatter-command", pick: ["name", "age"], omit: [] }]),
        );
    });

    it("should parse a frontmatter command with pick values that can be separated by spaces", () => {
        const template = "{# frontmatter pick: name, age #}";
        const result = parseTemplate(template);
        expect(result).toEqual(
            E.of([{ _tag: "frontmatter-command", pick: ["name", "age"], omit: [] }]),
        );
    });

    it("Should properly execute a template with a frontmatter command", () => {
        const template = "{# frontmatter #}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of(stringifyYaml({ name: "John", age: 18 })));
    });
    it("Should properly execute a template with a frontmatter command that specifies a pick", () => {
        const template = "{# frontmatter pick: name #}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
            E.map(tap("executed")),
        );
        expect(result).toEqual(E.of(stringifyYaml({ name: "John" })));
    });
    it("Should produce an empty string when a frontmatter command picks fields missing from the data", () => {
        const template = "{# frontmatter pick: doesNotExist #}";
        const parsed = parseTemplate(template);
        const result = pipe(
            parsed,
            E.map((parsedTemplate) => executeTemplate(parsedTemplate, { name: "John", age: 18 })),
        );
        expect(result).toEqual(E.of(""));
    });
});
