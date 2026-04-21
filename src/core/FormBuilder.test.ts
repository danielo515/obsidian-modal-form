import { makeBuilder } from "./FormBuilder";
import type { FormDefinition } from "./formDefinition";

// Pure function to create a test builder instance
const createTestBuilder = () => {
    const mockReporter = jest.fn();
    return {
        builder: makeBuilder(mockReporter),
        mockReporter,
    };
};

describe("FormBuilder", () => {
    describe("Basic Form Creation", () => {
        it("should create a form with basic fields", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form", "Example Form")
                .text({ name: "username", label: "Username" })
                .email({ name: "email", label: "Email" })
                .build();

            const expected: FormDefinition = {
                name: "example-form",
                title: "Example Form",
                version: "1",
                fields: [
                    {
                        name: "username",
                        label: "Username",
                        description: "",
                        input: { type: "text", hidden: false },
                    },
                    {
                        name: "email",
                        label: "Email",
                        description: "",
                        input: { type: "email", hidden: false },
                    },
                ],
            };

            expect(form).toEqual(expected);
        });

        it("should use name as title if title is not provided", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form").text({ name: "field" }).build();

            expect(form.title).toBe("example-form");
        });
    });

    describe("Field Properties", () => {
        it("should handle optional field properties", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .text({
                    name: "username",
                    label: "Username",
                    description: "Enter your username",
                    hidden: true,
                })
                .build();

            const expected = {
                name: "username",
                label: "Username",
                description: "Enter your username",
                input: { type: "text", hidden: true },
            };

            expect(form.fields[0]).toEqual(expected);
        });

        it("should set empty string as default description", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form").text({ name: "field" }).build();

            expect(form.fields[0]?.description).toBe("");
        });
    });

    describe("Field Types", () => {
        it("should create number fields with min/max", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form").slider({ name: "rating", min: 1, max: 5 }).build();

            const expected = {
                type: "slider" as const,
                min: 1,
                max: 5,
            };

            expect(form.fields[0]!.input).toEqual(expected);
        });

        it("should create select fields with options", () => {
            const { builder } = createTestBuilder();
            const options = ["Low", "Medium", "High"];
            const form = builder("example-form")
                .select({
                    name: "priority",
                    options,
                })
                .build();

            const expected = {
                type: "select" as const,
                source: "fixed" as const,
                options: options.map((value) => ({ value, label: value })),
            };

            expect(form.fields[0]?.input).toEqual(expected);
        });

        it("should create multiselect fields with options", () => {
            const { builder } = createTestBuilder();
            const options = ["work", "personal"];
            const form = builder("example-form")
                .multiselect({
                    name: "tags",
                    options,
                    allowUnknownValues: true,
                })
                .build();

            const expected = {
                type: "multiselect" as const,
                source: "fixed" as const,
                multi_select_options: options,
                allowUnknownValues: true,
            };

            expect(form.fields[0]?.input).toEqual(expected);
        });

        it("should create note fields with folder", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form").note({ name: "ref", folder: "Notes" }).build();

            const expected = {
                type: "note" as const,
                folder: "Notes",
            };

            expect(form.fields[0]!.input).toEqual(expected);
        });

        it("should create file fields with extensions", () => {
            const { builder } = createTestBuilder();
            const extensions = [".pdf"];
            const form = builder("example-form")
                .file({
                    name: "attachment",
                    folder: "uploads",
                    allowedExtensions: extensions,
                })
                .build();

            const expected = {
                type: "file" as const,
                folder: "uploads",
                allowedExtensions: extensions,
            };

            expect(form.fields[0]!.input).toEqual(expected);
        });
    });

    describe("Form Validation", () => {
        it("should report validation errors", () => {
            const { builder, mockReporter } = createTestBuilder();
            builder("example-form")
                // @ts-expect-error I want this to fail
                .slider({ name: "rating" }) // Invalid: min > max
                .build();

            expect(mockReporter).toHaveBeenCalledWith(
                "🚧 Error building form 🚧",
                expect.stringContaining("Invalid type"),
            );
        });

        it("should maintain immutability", () => {
            const { builder } = createTestBuilder();
            const builder1 = builder("form1").text({ name: "field1" });
            const builder2 = builder1.text({ name: "field2" });

            const form1 = builder1.build();
            const form2 = builder2.build();

            // Verify immutability by checking that form1 was not modified
            expect(form1.fields).toHaveLength(1);
            expect(form2.fields).toHaveLength(2);
            expect(form1.fields[0]!.name).toBe("field1");
            expect(form2.fields[1]!.name).toBe("field2");
        });
    });

    describe("Required Fields", () => {
        it("should set isRequired on a text field", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .text({ name: "username", required: true })
                .build();

            expect(form.fields[0]?.isRequired).toBe(true);
        });

        it("should leave isRequired undefined when not specified", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .text({ name: "username" })
                .build();

            expect(form.fields[0]?.isRequired).toBeUndefined();
        });

        it("should support required on all field types", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .text({ name: "f1", required: true })
                .number({ name: "f2", required: true })
                .date({ name: "f3", required: true })
                .select({ name: "f4", required: true, options: ["a"] })
                .textarea({ name: "f5", required: true })
                .email({ name: "f6", required: true })
                .build();

            for (const field of form.fields) {
                expect(field.isRequired).toBe(true);
            }
        });

        it("should allow mixing required and optional fields", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .text({ name: "required_field", required: true })
                .text({ name: "optional_field" })
                .text({ name: "explicitly_optional", required: false })
                .build();

            expect(form.fields[0]?.isRequired).toBe(true);
            expect(form.fields[1]?.isRequired).toBeUndefined();
            expect(form.fields[2]?.isRequired).toBe(false);
        });
    });

    describe("Convenience Methods", () => {
        it("should support shorthand methods", () => {
            const { builder } = createTestBuilder();
            const formWithShorthand = builder("example-form").text({ name: "name" }).build();
            const formWithLong = builder("example-form").addTextField({ name: "name" }).build();

            expect(formWithShorthand).toEqual(formWithLong);
        });

        it("should support multiselectNotes shorthand", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .multiselectNotes({
                    name: "people",
                    folder: "People",
                    folders: ["Extra"],
                })
                .build();

            expect(form.fields[0]?.input).toEqual({
                type: "multiselect",
                source: "notes",
                folder: "People",
                folders: ["Extra"],
            });
        });

        it("should omit empty folders array for multiselectNotes", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .multiselectNotes({ name: "people", folder: "People" })
                .build();

            expect(form.fields[0]?.input).toEqual({
                type: "multiselect",
                source: "notes",
                folder: "People",
            });
        });
    });

    describe("Dataview multiselect", () => {
        it("should create a multiselect with dataview source", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .multiselectQuery({
                    name: "spells",
                    query: "dv.pages('\"Spells\"').map((p) => p.file.name)",
                    allowUnknownValues: true,
                })
                .build();

            expect(form.fields[0]?.input).toEqual({
                type: "multiselect",
                source: "dataview",
                query: "dv.pages('\"Spells\"').map((p) => p.file.name)",
                allowUnknownValues: true,
            });
        });

        it("should default allowUnknownValues to false", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .multiselectQuery({ name: "spells", query: "dv.pages()" })
                .build();

            expect(form.fields[0]?.input).toEqual({
                type: "multiselect",
                source: "dataview",
                query: "dv.pages()",
                allowUnknownValues: false,
            });
        });
    });

    describe("Select from notes", () => {
        it("should create a select with notes source", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .selectFromNotes({ name: "author", folder: "People" })
                .build();

            expect(form.fields[0]?.input).toEqual({
                type: "select",
                source: "notes",
                folder: "People",
            });
        });
    });

    describe("Conditional fields", () => {
        it("should attach a condition to a field", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .text({ name: "trigger" })
                .text({
                    name: "child",
                    condition: { dependencyName: "trigger", type: "isSet" },
                })
                .build();

            expect(form.fields[1]?.condition).toEqual({
                dependencyName: "trigger",
                type: "isSet",
            });
        });

        it("should omit the condition property when not provided", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form").text({ name: "plain" }).build();

            expect(form.fields[0]).not.toHaveProperty("condition");
        });

        it("should support conditions on non-basic fields", () => {
            const { builder } = createTestBuilder();
            const form = builder("example-form")
                .number({ name: "level" })
                .multiselectQuery({
                    name: "spells",
                    query: "dv.pages()",
                    condition: { dependencyName: "level", type: "aboveOrEqual", value: 1 },
                })
                .build();

            expect(form.fields[1]?.condition).toEqual({
                dependencyName: "level",
                type: "aboveOrEqual",
                value: 1,
            });
        });
    });
});
