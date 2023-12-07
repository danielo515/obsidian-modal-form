import { get } from "svelte/store";
import { makeFormEngine } from "./formStore";

describe("Form Engine", () => {
    it("should update form fields correctly", () => {
        const onSubmitMock = jest.fn();
        const formEngine = makeFormEngine(onSubmitMock);

        // Add fields to the form
        const field1 = formEngine.addField({ name: "fieldName1" });
        const field2 = formEngine.addField({ name: "fieldName2" });
        // Update field values
        field1.value.set("value1");
        field2.value.set("value2");

        // Trigger form submission
        formEngine.triggerSubmit();
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
        formEngine.triggerSubmit();
        // Assert that the form is not valid
        expect(get(formEngine.isValid)).toBe(false);
        // Assert that the onSubmit callback is not called
        expect(onSubmitMock).not.toHaveBeenCalled();
        // Assert that the field has errors
        expect(get(field1.errors)).toEqual(["'fieldName1' is required"]);
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
        formEngine.triggerSubmit();
        // Assert that the form is not valid
        expect(get(formEngine.isValid)).toBe(false);
        // Assert that the onSubmit callback is not called
        expect(onSubmitMock).not.toHaveBeenCalled();
        // Assert that the field has errors
        expect(get(field1.errors)).toEqual(["'Field Label' is required"]);
    });
    it("Clears the errors when a value is set", () => {
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
        formEngine.triggerSubmit();
        expect(get(formEngine.isValid)).toBe(false);
        expect(onSubmitMock).not.toHaveBeenCalled();
        expect(get(field1.errors)).toEqual(["'Field Label' is required"]);
        // Set the field value, clearing the errors
        field1.value.set("value");
        // Assert that the field errors are cleared
        expect(get(field1.errors)).toEqual([]);
        formEngine.triggerSubmit();
        expect(get(formEngine.isValid)).toBe(true);
        // Assert that the onSubmit callback is called
        expect(onSubmitMock).toHaveBeenCalledWith({ fieldName1: "value" });
    });

    it("should use default values when field has not been changed, but if they change it should use the value", () => {
        const onSubmitMock = jest.fn();
        const defaultValues = {
            fieldName1: "default1",
            fieldName2: "default2",
        };
        const formEngine = makeFormEngine(onSubmitMock, defaultValues);

        // Add fields to the form
        const field1 = formEngine.addField({ name: "fieldName1" });
        const field2 = formEngine.addField({ name: "fieldName2" });

        // Assert that the default values are set
        expect(get(field1.value)).toBe("default1");
        expect(get(field2.value)).toBe("default2");
        field1.value.set("value1");
        formEngine.triggerSubmit();
        // Assert that the onSubmit callback is called with the correct values
        expect(onSubmitMock).toHaveBeenCalledWith({
            fieldName1: "value1",
            fieldName2: "default2",
        });
    });
    it("empty values that have not been modified should not be in the result", () => {
        const onSubmitMock = jest.fn();
        const defaultValues = {
            fieldName1: "default1",
        };
        const formEngine = makeFormEngine(onSubmitMock, defaultValues);

        // Add fields to the form
        const field1 = formEngine.addField({ name: "fieldName1" });
        formEngine.addField({ name: "fieldName2" });

        // Assert that the default values are set
        expect(get(field1.value)).toBe("default1");
        formEngine.triggerSubmit();
        // Assert that the onSubmit callback is called with the correct values
        expect(onSubmitMock).toHaveBeenCalledWith({
            fieldName1: "default1",
        });
    });
});
