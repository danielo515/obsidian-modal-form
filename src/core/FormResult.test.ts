jest.mock("obsidian");
import FormResult, { ModalFormData } from "./FormResult";

describe("FormResult", () => {
    const formData: ModalFormData = {
        name: "John Doe",
        age: 30,
        hobbies: ["reading", "swimming"],
        isEmployed: true,
    };

    describe("constructor", () => {
        it("should create a new FormResult instance with the provided data and status", () => {
            const result = FormResult.make(formData, "ok");
            expect(result).toBeInstanceOf(FormResult);
            expect(result.getData()).toEqual(formData);
            expect(result.status).toEqual("ok");
        });
    });

    describe("asFrontmatterString", () => {
        it("should return the data as a YAML frontmatter string", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30
hobbies:
  - reading
  - swimming
isEmployed: true
`;
            expect(result.asFrontmatterString()).toEqual(expectedOutput);
        });
    });

    describe("asDataviewProperties", () => {
        it("should return the data as a string of dataview properties", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30
hobbies:: "reading","swimming"
isEmployed:: true`;
            expect(result.asDataviewProperties()).toEqual(expectedOutput);
        });
    });

    describe("getData", () => {
        it("should return a copy of the data contained in the FormResult instance", () => {
            const result = FormResult.make(formData, "ok");
            const dataCopy = result.getData();
            expect(dataCopy).toEqual(formData);
            expect(dataCopy).not.toBe(formData);
        });
    });

    describe("asString", () => {
        it("should return the data formatted as a string matching the provided template", () => {
            const result = FormResult.make(formData, "ok");
            const template = "My name is {{name}}, and I am {{age}} years old.";
            const expectedOutput =
                "My name is John Doe, and I am 30 years old.";
            expect(result.asString(template)).toEqual(expectedOutput);
        });
    });
    describe("asDataviewProperties pick/omit", () => {
        it("should return the data as a string of dataview properties with only the specified keys using options.pick", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({ pick: ["name", "age"] }),
            ).toEqual(expectedOutput);
        });

        it("should return the data as a string of dataview properties with all keys except the specified ones using options.omit", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({
                    omit: ["hobbies", "isEmployed"],
                }),
            ).toEqual(expectedOutput);
        });

        it("should return the data as a string of dataview properties with only the specified keys using options.pick and ignoring options.omit", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({
                    pick: ["name", "age"],
                    omit: ["hobbies", "isEmployed"],
                }),
            ).toEqual(expectedOutput);
        });

        it("should return the data as a string of dataview properties with all keys except the specified ones using options.omit and ignoring options.pick", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({
                    omit: ["hobbies", "isEmployed"],
                    pick: ["name", "age"],
                }),
            ).toEqual(expectedOutput);
        });
    });
    describe("asFrontmatterString pick/omit", () => {
        it("should return the data as a YAML frontmatter string with only the specified keys using options.pick", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result.asFrontmatterString({ pick: ["name", "age"] }).trim(),
            ).toEqual(expectedOutput);
        });

        it("should return the data as a YAML frontmatter string with all keys except the specified ones using options.omit", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result
                    .asFrontmatterString({ omit: ["hobbies", "isEmployed"] })
                    .trim(),
            ).toEqual(expectedOutput);
        });

        it("should return the data as a YAML frontmatter string with only the specified keys using options.pick and ignoring options.omit", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result
                    .asFrontmatterString({
                        pick: ["name", "age"],
                        omit: ["hobbies", "isEmployed"],
                    })
                    .trim(),
            ).toEqual(expectedOutput);
        });

        it("should return the data as a YAML frontmatter string with all keys except the specified ones using options.omit and ignoring options.pick", () => {
            const result = FormResult.make(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result
                    .asFrontmatterString({
                        omit: ["hobbies", "isEmployed"],
                        pick: ["name", "age"],
                    })
                    .trim(),
            ).toEqual(expectedOutput);
        });
    });
    describe("get a single value", () => {
        it("should return the value of the specified key", () => {
            const result = FormResult.make(formData, "ok");
            expect(result.get("name")).toEqual("John Doe");
        });

        it("should return the value of the specified key transformed by the provided function", () => {
            const result = FormResult.make(formData, "ok");
            expect(
                result.get("age", (value) => {
                    if (typeof value !== "number") {
                        return 0;
                    }
                    return value + 1;
                }),
            ).toEqual(31);
        });

        it("should return an empty string if the specified key doesn't exist", () => {
            const result = FormResult.make(formData, "ok");
            expect(result.get("foo")).toEqual("");
        });
    });
    describe('Shorthand proxied accessors', () => {
        it('Should allow access to a value in the data directly using dot notation',
            () => {
                const result = FormResult.make(formData, "ok");
                // @ts-ignore
                expect(result.name.toString()).toEqual("John Doe");
            })
        it('Should allow access to a value in the data directly and allow to use shorthand methods on the returned value',
            () => {
                const result = FormResult.make(formData, "ok");
                // @ts-ignore
                expect(result.name.upper.toString()).toEqual("JOHN DOE");
            }
        )
        it('proxied access to bullet list should return a bullet list', () => {
            const result = FormResult.make(formData, "ok");
            // @ts-ignore
            expect(result.hobbies.bullets).toEqual("- reading\n- swimming");
        })
        it('accessing a non existing key should return a safe ResultValue, letting chain without issues', () => {
            const result = FormResult.make(formData, "ok");
            // @ts-ignore
            expect(result.foo.upper.lower.toString()).toEqual("");
        })
    })

});
