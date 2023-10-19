import {
    FieldTypeReadable,
    isDataViewSource,
    isInputNoteFromFolder,
    isInputSelectFixed,
    isInputSlider,
    isSelectFromNotes,
} from "./formDefinition";

describe("FieldTypeReadable", () => {
    it("should have the correct readable names for field types", () => {
        expect(FieldTypeReadable.text).toBe("Text");
        expect(FieldTypeReadable.number).toBe("Number");
        expect(FieldTypeReadable.date).toBe("Date");
        expect(FieldTypeReadable.time).toBe("Time");
        expect(FieldTypeReadable.datetime).toBe("DateTime");
        expect(FieldTypeReadable.textarea).toBe("Text area");
        expect(FieldTypeReadable.toggle).toBe("Toggle");
        expect(FieldTypeReadable.note).toBe("Note");
        expect(FieldTypeReadable.slider).toBe("Slider");
        expect(FieldTypeReadable.select).toBe("Select");
        expect(FieldTypeReadable.dataview).toBe("Dataview");
        expect(FieldTypeReadable.multiselect).toBe("Multiselect");
    });
});

describe("isDataViewSource", () => {
    it("should return true for valid inputDataviewSource objects", () => {
        expect(
            isDataViewSource({ type: "dataview", query: "some query" })
        ).toBe(true);
    });

    it("should return false for invalid inputDataviewSource objects", () => {
        expect(isDataViewSource({ type: "dataview" })).toBe(false);
        expect(isDataViewSource({ type: "dataview", query: 123 })).toBe(false);
        expect(isDataViewSource({ type: "select", query: "some query" })).toBe(
            false
        );
    });
});

describe("isInputNoteFromFolder", () => {
    it("should return true for valid inputNoteFromFolder objects", () => {
        expect(
            isInputNoteFromFolder({ type: "note", folder: "some folder" })
        ).toBe(true);
    });

    it("should return false for invalid inputNoteFromFolder objects", () => {
        expect(isInputNoteFromFolder({ type: "note" })).toBe(false);
        expect(isInputNoteFromFolder({ type: "note", folder: 123 })).toBe(
            false
        );
        expect(
            isInputNoteFromFolder({ type: "select", folder: "some folder" })
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
            })
        ).toBe(true);
    });

    it("should return false for invalid inputSelectFixed objects", () => {
        expect(isInputSelectFixed({ type: "select", source: "fixed" })).toBe(
            false
        );
        expect(
            isInputSelectFixed({
                type: "select",
                source: "fixed",
                options: [{ value: "1", label: 123 }],
            })
        ).toBe(false);
        expect(
            isInputSelectFixed({
                type: "select",
                source: "notes",
                options: [{ value: "1", label: "Option 1" }],
            })
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
            false
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
            })
        ).toBe(true);
    });

    it("should return false for invalid selectFromNotes objects", () => {
        expect(isSelectFromNotes({ type: "select", source: "notes" })).toBe(
            false
        );
        expect(
            isSelectFromNotes({ type: "select", source: "notes", folder: 123 })
        ).toBe(false);
        expect(isSelectFromNotes({ type: "note", folder: "some folder" })).toBe(
            false
        );
    });
});
