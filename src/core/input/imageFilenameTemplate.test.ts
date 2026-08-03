import { FileProxy } from "../files/FileProxy";
import { createFilename, processTemplate, sanitizeFilename } from "./imageFilenameTemplate";

const now = new Date(2024, 11, 8, 19, 29, 52);

describe("processTemplate", () => {
    it("replaces the built-in date placeholders", () => {
        expect(processTemplate("{{date}}", {}, now)).toBe("2024-12-08");
        expect(processTemplate("{{time}}", {}, now)).toBe("19-29-52");
        expect(processTemplate("{{datetime}}", {}, now)).toBe("2024-12-08-19-29-52");
    });

    it("tolerates whitespace inside the placeholder", () => {
        expect(processTemplate("{{ datetime }}", {}, now)).toBe("2024-12-08-19-29-52");
        expect(processTemplate("{{  name  }}", { name: "Jane" }, now)).toBe("Jane");
    });

    it("replaces every occurrence of a placeholder", () => {
        expect(processTemplate("{{date}}-{{date}}", {}, now)).toBe("2024-12-08-2024-12-08");
        expect(processTemplate("{{name}}-{{name}}", { name: "Jane" }, now)).toBe("Jane-Jane");
    });

    it("replaces placeholders with the value of the form field of the same name", () => {
        expect(processTemplate("{{name}} - new member", { name: "Jane Doe" }, now)).toBe(
            "Jane Doe - new member",
        );
    });

    it("renders non string field values", () => {
        const values = { age: 42, active: true, tags: ["one", "two"] };
        expect(processTemplate("{{age}}-{{active}}-{{tags}}", values, now)).toBe(
            "42-true-one-two",
        );
    });

    it("renders file fields using their name without extension", () => {
        const file = new FileProxy({
            path: "attachments/avatar.png",
            name: "avatar.png",
            basename: "avatar",
            extension: "png",
        });
        expect(processTemplate("{{avatar}}", { avatar: file }, now)).toBe("avatar");
    });

    it("resolves unknown placeholders to an empty string", () => {
        expect(processTemplate("a-{{missing}}-b", { name: "Jane" }, now)).toBe("a--b");
    });

    it("resolves inherited object properties to an empty string", () => {
        // `name in object` would report these as present and resolve them to
        // members of Object.prototype, so they need an own property check
        const template = "a-{{__proto__}}-{{toString}}-{{constructor}}-b";
        expect(processTemplate(template, {}, now)).toBe("a----b");
    });

    it("keeps the built-in placeholders when a field shares their name", () => {
        expect(processTemplate("{{date}}", { date: "not a date" }, now)).toBe("2024-12-08");
    });

    it("leaves templates without placeholders untouched", () => {
        expect(processTemplate("just-an-image", {}, now)).toBe("just-an-image");
    });
});

describe("sanitizeFilename", () => {
    it("replaces the characters that are invalid on a filename", () => {
        expect(sanitizeFilename('a<b>c:d"e/f\\g|h?i*j')).toBe("a-b-c-d-e-f-g-h-i-j");
    });
});

describe("createFilename", () => {
    it("sanitizes the values coming from the form", () => {
        expect(createFilename("{{name}}", { name: "folder/name" }, now)).toBe("folder-name");
    });

    it("trims the result", () => {
        expect(createFilename("  {{name}}  ", { name: "Jane" }, now)).toBe("Jane");
    });

    it("falls back to a datetime filename when everything resolves to nothing", () => {
        expect(createFilename("{{missing}}", {}, now)).toBe("2024-12-08-19-29-52");
    });

    it("works without form values, as it did before field placeholders existed", () => {
        expect(createFilename("image-{{datetime}}")).toMatch(
            /^image-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/,
        );
    });
});
