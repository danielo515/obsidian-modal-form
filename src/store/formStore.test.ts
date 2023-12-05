import { get } from "svelte/store";
import { makeFormEngine } from "./formStore";

describe("Form Engine", () => {
    it("should update form fields correctly", () => {
        const onSubmitMock = jest.fn(console.dir);
        const formEngine = makeFormEngine(onSubmitMock);

        // Add fields to the form
        const field1 = formEngine.addField({ name: "fieldName1" });
        const field2 = formEngine.addField({ name: "fieldName2" });
        // Update field values
        field1.value.set("value1");
        field2.value.set("value2");

        // Trigger form submission
        formEngine.onSubmit();
        // Assert that the onSubmit callback is called with the correct values
        expect(onSubmitMock).toHaveBeenCalledWith({
            fieldName1: "value1",
            fieldName2: "value2",
        });
    });

    it("should handle field errors correctly", () => {
        const onSubmitMock = jest.fn();
        const formEngine = makeFormEngine(onSubmitMock);
        // Add a field to the form
        const field1 = formEngine.addField({
            name: "fieldName1",
            isRequired: true,
        });
        // Update field value with an empty string
        field1.value.set("");
        // Trigger form submission
        formEngine.onSubmit();
        // Assert that the form is not valid
        expect(get(formEngine.isValid)).toBe(false);
        // Assert that the onSubmit callback is not called
        expect(onSubmitMock).not.toHaveBeenCalled();
        // Assert that the field has errors
        expect(get(field1.errors)).toEqual(["fieldName1 is required"]);
    });
    it("field errors should prefer field label over field name", () => {
        const onSubmitMock = jest.fn();
        const formEngine = makeFormEngine(onSubmitMock);
        // Add a field to the form
        const field1 = formEngine.addField({
            name: "fieldName1",
            label: "Field Label",
            isRequired: true,
        });
        // Update field value with an empty string
        field1.value.set("");
        // Trigger form submission
        formEngine.onSubmit();
        // Assert that the form is not valid
        expect(get(formEngine.isValid)).toBe(false);
        // Assert that the onSubmit callback is not called
        expect(onSubmitMock).not.toHaveBeenCalled();
        // Assert that the field has errors
        expect(get(field1.errors)).toEqual(["Field Label is required"]);
    });
});
