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
            const result = new FormResult(formData, "ok");
            expect(result).toBeInstanceOf(FormResult);
            expect(result.getData()).toEqual(formData);
            expect(result.status).toEqual("ok");
        });
    });

    describe("asFrontmatterString", () => {
        it("should return the data as a YAML frontmatter string", () => {
            const result = new FormResult(formData, "ok");
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
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30
hobbies:: "reading","swimming"
isEmployed:: true`;
            expect(result.asDataviewProperties()).toEqual(expectedOutput);
        });
    });

    describe("getData", () => {
        it("should return a copy of the data contained in the FormResult instance", () => {
            const result = new FormResult(formData, "ok");
            const dataCopy = result.getData();
            expect(dataCopy).toEqual(formData);
            expect(dataCopy).not.toBe(formData);
        });
    });

    describe("asString", () => {
        it("should return the data formatted as a string matching the provided template", () => {
            const result = new FormResult(formData, "ok");
            const template = "My name is {{name}}, and I am {{age}} years old.";
            const expectedOutput =
                "My name is John Doe, and I am 30 years old.";
            expect(result.asString(template)).toEqual(expectedOutput);
        });
    });
    describe("asDataviewProperties pick/omit", () => {
        it("should return the data as a string of dataview properties with only the specified keys using options.pick", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({ pick: ["name", "age"] })
            ).toEqual(expectedOutput);
        });

        it("should return the data as a string of dataview properties with all keys except the specified ones using options.omit", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({ omit: ["hobbies", "isEmployed"] })
            ).toEqual(expectedOutput);
        });

        it("should return the data as a string of dataview properties with only the specified keys using options.pick and ignoring options.omit", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({
                    pick: ["name", "age"],
                    omit: ["hobbies", "isEmployed"],
                })
            ).toEqual(expectedOutput);
        });

        it("should return the data as a string of dataview properties with all keys except the specified ones using options.omit and ignoring options.pick", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name:: John Doe
age:: 30`;
            expect(
                result.asDataviewProperties({
                    omit: ["hobbies", "isEmployed"],
                    pick: ["name", "age"],
                })
            ).toEqual(expectedOutput);
        });
    });
    describe("asFrontmatterString pick/omit", () => {
        it("should return the data as a YAML frontmatter string with only the specified keys using options.pick", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result.asFrontmatterString({ pick: ["name", "age"] }).trim()
            ).toEqual(expectedOutput);
        });

        it("should return the data as a YAML frontmatter string with all keys except the specified ones using options.omit", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result
                    .asFrontmatterString({ omit: ["hobbies", "isEmployed"] })
                    .trim()
            ).toEqual(expectedOutput);
        });

        it("should return the data as a YAML frontmatter string with only the specified keys using options.pick and ignoring options.omit", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result
                    .asFrontmatterString({
                        pick: ["name", "age"],
                        omit: ["hobbies", "isEmployed"],
                    })
                    .trim()
            ).toEqual(expectedOutput);
        });

        it("should return the data as a YAML frontmatter string with all keys except the specified ones using options.omit and ignoring options.pick", () => {
            const result = new FormResult(formData, "ok");
            const expectedOutput = `name: John Doe
age: 30`;
            expect(
                result
                    .asFrontmatterString({
                        omit: ["hobbies", "isEmployed"],
                        pick: ["name", "age"],
                    })
                    .trim()
            ).toEqual(expectedOutput);
        });
    });
});
