import { createFilename, processTemplate, sanitizeFilename } from "./imageFilenameTemplate";

beforeAll(() => {
    // Stub window.moment for the date/time placeholders so date-independent
    // assertions remain stable across runs.
    const fakeMoment = () => ({ format: (fmt: string) => `MOMENT(${fmt})` });
    (globalThis as { window?: unknown }).window = { moment: fakeMoment };
});

describe("processTemplate", () => {
    it("replaces {{date}}, {{time}}, and {{datetime}} placeholders", () => {
        expect(processTemplate("a-{{date}}-{{time}}-{{datetime}}")).toBe(
            "a-MOMENT(YYYY-MM-DD)-MOMENT(HH-mm-ss)-MOMENT(YYYY-MM-DD-HH-mm-ss)",
        );
    });

    it("expands {{filename}} to the original basename without extension", () => {
        expect(processTemplate("img-{{filename}}", { originalName: "vacation.png" })).toBe(
            "img-vacation",
        );
    });

    it("preserves the basename when the original has no extension", () => {
        expect(processTemplate("{{filename}}", { originalName: "scan" })).toBe("scan");
    });

    it("keeps dotfile names intact when there is no extension to strip", () => {
        // ".gitignore" has no real extension — only a leading dot — so we keep it as-is.
        expect(processTemplate("{{filename}}", { originalName: ".gitignore" })).toBe(".gitignore");
    });

    it("strips only the last extension for filenames with multiple dots", () => {
        expect(processTemplate("{{filename}}", { originalName: "archive.tar.gz" })).toBe(
            "archive.tar",
        );
    });

    it("falls back to 'image' when no original filename is provided", () => {
        expect(processTemplate("{{filename}}")).toBe("image");
    });

    it("expands the same placeholder multiple times", () => {
        expect(processTemplate("{{filename}}-{{filename}}", { originalName: "a.jpg" })).toBe("a-a");
    });

    it("returns the input unchanged when there are no placeholders", () => {
        expect(processTemplate("plain.png")).toBe("plain.png");
    });
});

describe("sanitizeFilename", () => {
    it("replaces filesystem-unsafe characters with hyphens", () => {
        expect(sanitizeFilename('a<b>c:"d/e\\f|g?h*i')).toBe("a-b-c--d-e-f-g-h-i");
    });
});

describe("createFilename", () => {
    it("expands placeholders and sanitizes the result", () => {
        expect(createFilename("{{filename}}-{{date}}", { originalName: "my:photo.jpg" })).toBe(
            "my-photo-MOMENT(YYYY-MM-DD)",
        );
    });
});
