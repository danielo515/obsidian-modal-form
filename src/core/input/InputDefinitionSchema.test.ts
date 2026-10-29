import { filterTags } from "./InputDefinitionSchema";

describe("filterTags", () => {
    const tags = ["Setting/Event", "Setting/Theme", "Project/Alpha", "archive/2024"];

    it("returns all tags when neither include nor exclude is set", () => {
        expect(filterTags(tags, {})).toEqual(tags);
    });

    it("keeps only tags matching the include regex", () => {
        expect(filterTags(tags, { include: "^Setting/" })).toEqual([
            "Setting/Event",
            "Setting/Theme",
        ]);
    });

    it("drops tags matching the exclude regex", () => {
        expect(filterTags(tags, { exclude: "^archive/" })).toEqual([
            "Setting/Event",
            "Setting/Theme",
            "Project/Alpha",
        ]);
    });

    it("combines include and exclude — include first, then exclude", () => {
        expect(
            filterTags(tags, { include: "^Setting/", exclude: "Theme$" }),
        ).toEqual(["Setting/Event"]);
    });

    it("treats an invalid include regex as no filter (fail-safe)", () => {
        expect(filterTags(tags, { include: "[unterminated" })).toEqual(tags);
    });

    it("treats an invalid exclude regex as no filter (fail-safe)", () => {
        expect(filterTags(tags, { exclude: "[unterminated" })).toEqual(tags);
    });

    it("treats empty strings as no filter", () => {
        expect(filterTags(tags, { include: "", exclude: "" })).toEqual(tags);
    });
});
