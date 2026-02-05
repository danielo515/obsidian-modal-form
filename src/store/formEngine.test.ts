import { get } from "svelte/store";
import { makeFormEngine } from "./formEngine";

describe("Form Engine", () => {
  it("should update form fields correctly", () => {
    const onSubmitMock = jest.fn();
    const formEngine = makeFormEngine({
      onSubmit: onSubmitMock,
      onCancel: console.log,
    });

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
    const formEngine = makeFormEngine({
      onSubmit: onSubmitMock,
      onCancel: console.log,
    });
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
    const formEngine = makeFormEngine({
      onSubmit: onSubmitMock,
      onCancel: console.log,
    });
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
    const formEngine = makeFormEngine({
      onSubmit: onSubmitMock,
      onCancel: console.log,
    });
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
    const formEngine = makeFormEngine({
      onSubmit: onSubmitMock,
      defaultValues,
      onCancel: console.log,
    });

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
    const formEngine = makeFormEngine({
      onSubmit: onSubmitMock,
      defaultValues,
      onCancel: console.log,
    });

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
  describe("number field coercion", () => {
    // The addField interface type doesn't include `input`, but the implementation
    // (which accepts FieldDefinition) uses it for type coercion at runtime.
    // We use variables to avoid TypeScript excess property checking on object literals.
    const numberField = { name: "age", input: { type: "number" } };
    const sliderField = { name: "rating", input: { type: "slider", min: 0, max: 10 } };
    const textField = { name: "zipcode", input: { type: "text" } };
    const priceField = { name: "price", input: { type: "number" } };

    it("should coerce string values to numbers for number fields on setValue", () => {
      const onSubmitMock = jest.fn();
      const formEngine = makeFormEngine({
        onSubmit: onSubmitMock,
        onCancel: console.log,
      });

      const field = formEngine.addField(numberField);
      field.value.set("123");

      formEngine.triggerSubmit();
      expect(onSubmitMock).toHaveBeenCalledWith({ age: 123 });
    });

    it("should coerce string default values to numbers for number fields", () => {
      const onSubmitMock = jest.fn();
      const formEngine = makeFormEngine({
        onSubmit: onSubmitMock,
        onCancel: console.log,
        defaultValues: { age: "30" },
      });

      formEngine.addField(numberField);

      formEngine.triggerSubmit();
      expect(onSubmitMock).toHaveBeenCalledWith({ age: 30 });
    });

    it("should coerce string values to numbers for slider fields", () => {
      const onSubmitMock = jest.fn();
      const formEngine = makeFormEngine({
        onSubmit: onSubmitMock,
        onCancel: console.log,
      });

      const field = formEngine.addField(sliderField);
      field.value.set("7");

      formEngine.triggerSubmit();
      expect(onSubmitMock).toHaveBeenCalledWith({ rating: 7 });
    });

    it("should not coerce string values for text fields", () => {
      const onSubmitMock = jest.fn();
      const formEngine = makeFormEngine({
        onSubmit: onSubmitMock,
        onCancel: console.log,
      });

      const field = formEngine.addField(textField);
      field.value.set("12345");

      formEngine.triggerSubmit();
      expect(onSubmitMock).toHaveBeenCalledWith({ zipcode: "12345" });
    });

    it("should handle decimal number strings", () => {
      const onSubmitMock = jest.fn();
      const formEngine = makeFormEngine({
        onSubmit: onSubmitMock,
        onCancel: console.log,
      });

      const field = formEngine.addField(priceField);
      field.value.set("19.99");

      formEngine.triggerSubmit();
      expect(onSubmitMock).toHaveBeenCalledWith({ price: 19.99 });
    });

    it("should pass through actual number values unchanged for number fields", () => {
      const onSubmitMock = jest.fn();
      const formEngine = makeFormEngine({
        onSubmit: onSubmitMock,
        onCancel: console.log,
      });

      const field = formEngine.addField(numberField);
      field.value.set(42);

      formEngine.triggerSubmit();
      expect(onSubmitMock).toHaveBeenCalledWith({ age: 42 });
    });

    it("should return original string value when coercion to number fails", () => {
      const onSubmitMock = jest.fn();
      const formEngine = makeFormEngine({
        onSubmit: onSubmitMock,
        onCancel: console.log,
      });

      const field = formEngine.addField(numberField);
      field.value.set("not-a-number");

      formEngine.triggerSubmit();
      expect(onSubmitMock).toHaveBeenCalledWith({ age: "not-a-number" });
    });
  });

  it("should flag the form as cancelled and call the onCancel callback when the cancel button is clicked", () => {
    const onCancelMock = jest.fn();
    const formEngine = makeFormEngine({
      onSubmit: console.log,
      onCancel: onCancelMock,
    });
    // Add a field to the form
    const field1 = formEngine.addField({ name: "fieldName1" });
    // Update field value with an empty string
    field1.value.set("");
    // Trigger form submission
    formEngine.triggerCancel();
    // Assert that the onCancel callback is called
    expect(onCancelMock).toHaveBeenCalled();
    // Assert that the form is not valid
    // expect(get(formEngine.isValid)).toBe(false); // is it worth checking this?
  });
});
