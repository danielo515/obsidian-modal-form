import { formDataFromFormDefaults } from "./formDataFromFormDefaults";
import { FormDefinition } from "./formDefinition";

describe("formDataFromFormOptions", () => {
    const fields: FormDefinition["fields"] = [
        { name: "age", description: "", input: { type: "number", hidden: false } },
        {
            name: "name",
            description: "Enter your name",
            input: { type: "text", hidden: false },
        },
        { name: "age", description: "", input: { type: "number", hidden: false } },
        {
            name: "hobbies",
            description: "Select your hobbies",
            input: {
                type: "multiselect",
                source: "fixed",
                allowUnknownValues: false,
                multi_select_options: ["reading", "swimming", "running"],
            },
        },
        { name: "isEmployed", description: "", input: { type: "toggle", hidden: false } },
    ];

    it("should return the correct form data when all values are valid", () => {
        const values = {
            name: "John Doe",
            age: 30,
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };

        const expectedFormData = {
            name: "John Doe",
            age: 30,
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };

        const result = formDataFromFormDefaults(fields, values);
        expect(result).toEqual(expectedFormData);
    });

    it("should ignore invalid keys and return the correct form data", () => {
        const values = {
            name: "John Doe",
            age: 30,
            hobbies: ["reading", "swimming"],
            isEmployed: true,
            invalidKey: "invalidValue",
        };

        const expectedFormData = {
            name: "John Doe",
            age: 30,
            hobbies: ["reading", "swimming"],
            isEmployed: true,
        };

        const result = formDataFromFormDefaults(fields, values);
        expect(result).toEqual(expectedFormData);
    });

    it("should ensure toggles always have a value even when no values are provided", () => {
        const values = {};

        const expectedFormData = { isEmployed: false };

        const result = formDataFromFormDefaults(fields, values);
        expect(result).toEqual(expectedFormData);
    });

    it("should return the correct form data when some values are missing", () => {
        const values = {
            name: "John Doe",
            age: 30,
            isEmployed: true,
        };

        const expectedFormData = {
            name: "John Doe",
            age: 30,
            isEmployed: true,
        };

        const result = formDataFromFormDefaults(fields, values);
        expect(result).toEqual(expectedFormData);
    });
});
