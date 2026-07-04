jest.mock("obsidian");

import { replaceRemainingOptions } from "./MultiSelectModel";

describe("replaceRemainingOptions", () => {
    it("refreshes dataview options without re-adding selected values", () => {
        const remainingOptions = new Set(["old", "selected"]);

        replaceRemainingOptions(remainingOptions, ["selected", "next", "other"], ["selected"]);

        expect([...remainingOptions]).toEqual(["next", "other"]);
    });
});
