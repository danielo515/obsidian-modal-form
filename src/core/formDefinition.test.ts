import { MultiselectSchema } from "./InputDefinitionSchema";
import {
    isDataViewSource,
    isInputNoteFromFolder,
    isInputSelectFixed,
    isInputSlider,
    isSelectFromNotes,
} from "./formDefinition";
import { parse } from "valibot";

describe("isDataViewSource", () => {
    it("should return true for valid inputDataviewSource objects", () => {
        expect(
            isDataViewSource({ type: "dataview", query: "some query" }),
        ).toBe(true);
    });

    it("should return false for invalid inputDataviewSource objects", () => {
        expect(isDataViewSource({ type: "dataview" })).toBe(false);
        expect(isDataViewSource({ type: "dataview", query: 123 })).toBe(false);
        expect(isDataViewSource({ type: "select", query: "some query" })).toBe(
            false,
        );
    });
});

describe("isInputNoteFromFolder", () => {
    it("should return true for valid inputNoteFromFolder objects", () => {
        expect(
            isInputNoteFromFolder({ type: "note", folder: "some folder" }),
        ).toBe(true);
    });

    it("should return false for invalid inputNoteFromFolder objects", () => {
        expect(isInputNoteFromFolder({ type: "note" })).toBe(false);
        expect(isInputNoteFromFolder({ type: "note", folder: 123 })).toBe(
            false,
        );
        expect(
            isInputNoteFromFolder({ type: "select", folder: "some folder" }),
        ).toBe(false);
    });
});

describe("isInputSelectFixed", () => {
    it("should return true for valid inputSelectFixed objects", () => {
        expect(
            isInputSelectFixed({
                type: "select",
                source: "fixed",
                options: [{ value: "1", label: "Option 1" }],
            }),
        ).toBe(true);
    });

    it("should return false for invalid inputSelectFixed objects", () => {
        expect(isInputSelectFixed({ type: "select", source: "fixed" })).toBe(
            false,
        );
        expect(
            isInputSelectFixed({
                type: "select",
                source: "fixed",
                options: [{ value: "1", label: 123 }],
            }),
        ).toBe(false);
        expect(
            isInputSelectFixed({
                type: "select",
                source: "notes",
                options: [{ value: "1", label: "Option 1" }],
            }),
        ).toBe(false);
    });
});

describe("isInputSlider", () => {
    it("should return true for valid inputSlider objects", () => {
        expect(isInputSlider({ type: "slider", min: 0, max: 10 })).toBe(true);
    });

    it("should return false for invalid inputSlider objects", () => {
        expect(isInputSlider({ type: "slider" })).toBe(false);
        expect(isInputSlider({ type: "slider", min: "0", max: 10 })).toBe(
            false,
        );
        expect(isInputSlider({ type: "select", min: 0, max: 10 })).toBe(false);
    });
});

describe("isSelectFromNotes", () => {
    it("should return true for valid selectFromNotes objects", () => {
        expect(
            isSelectFromNotes({
                type: "select",
                source: "notes",
                folder: "some folder",
            }),
        ).toBe(true);
    });

    it("should return false for invalid selectFromNotes objects", () => {
        expect(isSelectFromNotes({ type: "select", source: "notes" })).toBe(
            false,
        );
        expect(
            isSelectFromNotes({ type: "select", source: "notes", folder: 123 }),
        ).toBe(false);
        expect(isSelectFromNotes({ type: "note", folder: "some folder" })).toBe(
            false,
        );
    });
});
describe("MultiSelectFixedSchema", () => {
    it("should validate a valid multiselect fixed schema", () => {
        const validSchema = {
            type: "multiselect",
            source: "fixed",
            multi_select_options: ["Option 1", "Option 2", "Option 3"],
        };
        expect(parse(MultiselectSchema, validSchema)).toEqual(validSchema);
    });

    it("should not validate an invalid multiselect fixed schema with missing properties", () => {
        const invalidSchema = {
            type: "multiselect",
            source: "fixed",
        };
        expect(() => parse(MultiselectSchema, invalidSchema)).toThrow();
    });

    it("should not validate an invalid multiselect fixed schema with incorrect properties", () => {
        const invalidSchema = {
            type: "multiselect",
            source: "fixed",
            multi_select_options: ["Option 1", 2, "Option 3"],
        };
        expect(() => parse(MultiselectSchema, invalidSchema)).toThrow();
    });
});

describe("MultiSelectNotesSchema", () => {
    it("should validate a valid multiselect notes schema", () => {
        const validSchema = {
            type: "multiselect",
            source: "notes",
            folder: "some folder",
        };
        expect(parse(MultiselectSchema, validSchema)).toEqual(validSchema);
    });

    it("should not validate an invalid multiselect notes schema with missing properties", () => {
        const invalidSchema = {
            type: "multiselect",
            source: "notes",
        };
        expect(() => parse(MultiselectSchema, invalidSchema)).toThrow();
    });

    it("should not validate an invalid multiselect notes schema with incorrect properties", () => {
        const invalidSchema = {
            type: "multiselect",
            source: "notes",
            folder: 123,
        };
        expect(() => parse(MultiselectSchema, invalidSchema)).toThrow();
    });
});
