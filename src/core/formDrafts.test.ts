import { O } from "@std";
import {
    DRAFT_MAX_AGE_MS,
    MAX_STORED_DRAFTS,
    draftHasContent,
    makeFormDraftStore,
    parseDrafts,
    pruneDrafts,
    sanitizeDraftData,
    type DraftStorage,
    type FormDraft,
} from "./formDrafts";

function makeMemoryStorage(initial: unknown = null): DraftStorage & { value: unknown } {
    return {
        value: initial,
        load() {
            // Simulates a round trip through local storage, so tests catch
            // anything that survives only because it is the same object.
            return this.value === null ? null : JSON.parse(JSON.stringify(this.value));
        },
        save(value) {
            this.value = value;
        },
    };
}

function draft(overrides: Partial<FormDraft> = {}): FormDraft {
    return {
        formName: "my-form",
        formTitle: "My form",
        savedAt: 1000,
        status: "pending",
        data: { title: "hello" },
        ...overrides,
    };
}

describe("sanitizeDraftData", () => {
    it("keeps primitives and arrays of primitives", () => {
        expect(
            sanitizeDraftData({
                text: "a",
                count: 3,
                flag: true,
                tags: ["x", "y"],
            }),
        ).toEqual({ text: "a", count: 3, flag: true, tags: ["x", "y"] });
    });

    it("drops values we cannot store and read back", () => {
        expect(
            sanitizeDraftData({
                good: "a",
                file: { path: "note.md", basename: "note" },
                fn: () => "nope",
                nested: [{ a: 1 }],
                nothing: undefined,
            }),
        ).toEqual({ good: "a" });
    });
});

describe("draftHasContent", () => {
    it.each([
        [{}, false],
        [{ a: "" }, false],
        [{ a: false }, false],
        [{ a: [] }, false],
        [{ a: "x" }, true],
        [{ a: true }, true],
        [{ a: 0 }, true],
        [{ a: ["x"] }, true],
        [{ a: "", b: false, c: ["x"] }, true],
    ])("%p is %p", (data, expected) => {
        expect(draftHasContent(data)).toBe(expected);
    });
});

describe("parseDrafts", () => {
    it("returns nothing for absent or malformed storage", () => {
        expect(parseDrafts(null)).toEqual([]);
        expect(parseDrafts(undefined)).toEqual([]);
        expect(parseDrafts("garbage")).toEqual([]);
        expect(parseDrafts({ drafts: "not an array" })).toEqual([]);
    });

    it("reads back what was stored, dropping unusable values", () => {
        const stored = {
            version: 1,
            drafts: [
                {
                    formName: "a",
                    formTitle: "A",
                    savedAt: 5,
                    status: "submitted",
                    data: { good: "x", bad: { nope: true } },
                },
            ],
        };
        expect(parseDrafts(stored)).toEqual([
            {
                formName: "a",
                formTitle: "A",
                savedAt: 5,
                status: "submitted",
                data: { good: "x" },
            },
        ]);
    });

    it("falls back to sensible values for older or partial entries", () => {
        expect(parseDrafts({ drafts: [{ formName: "a", savedAt: 5 }] })).toEqual([
            { formName: "a", formTitle: "a", savedAt: 5, status: "pending", data: {} },
        ]);
    });
});

describe("pruneDrafts", () => {
    it("sorts newest first", () => {
        const result = pruneDrafts(
            [draft({ formName: "old", savedAt: 1 }), draft({ formName: "new", savedAt: 2 })],
            10,
        );
        expect(result.map((d) => d.formName)).toEqual(["new", "old"]);
    });

    it("drops expired drafts", () => {
        const now = DRAFT_MAX_AGE_MS + 100;
        const result = pruneDrafts(
            [
                draft({ formName: "expired", savedAt: 50 }),
                draft({ formName: "fresh", savedAt: now }),
            ],
            now,
        );
        expect(result.map((d) => d.formName)).toEqual(["fresh"]);
    });

    it("keeps at most MAX_STORED_DRAFTS entries", () => {
        const drafts = Array.from({ length: MAX_STORED_DRAFTS + 5 }, (_, i) =>
            draft({ formName: `form-${i}`, savedAt: i }),
        );
        expect(pruneDrafts(drafts, MAX_STORED_DRAFTS + 5)).toHaveLength(MAX_STORED_DRAFTS);
    });
});

describe("makeFormDraftStore", () => {
    it("stores and recovers a draft", () => {
        const storage = makeMemoryStorage();
        const store = makeFormDraftStore(storage, { now: () => 100 });
        store.save({
            formName: "my-form",
            formTitle: "My form",
            status: "pending",
            data: { title: "unfinished business" },
        });
        expect(store.recover("my-form")).toEqual(
            O.some({
                formName: "my-form",
                formTitle: "My form",
                savedAt: 100,
                status: "pending",
                data: { title: "unfinished business" },
            }),
        );
    });

    it("does not store an empty draft, and clears a previous one", () => {
        const storage = makeMemoryStorage();
        const store = makeFormDraftStore(storage, { now: () => 100 });
        store.save({ formName: "f", formTitle: "F", status: "pending", data: { a: "x" } });
        store.save({ formName: "f", formTitle: "F", status: "pending", data: { a: "" } });
        expect(store.list()).toEqual([]);
        expect(storage.value).toBeNull();
    });

    it("replaces the draft of the same form instead of piling up", () => {
        const storage = makeMemoryStorage();
        let now = 1;
        const store = makeFormDraftStore(storage, { now: () => now });
        store.save({ formName: "f", formTitle: "F", status: "pending", data: { a: "one" } });
        now = 2;
        store.save({ formName: "f", formTitle: "F", status: "pending", data: { a: "two" } });
        expect(store.list()).toHaveLength(1);
        expect(store.find("f")).toEqual(O.some(expect.objectContaining({ data: { a: "two" } })));
    });

    it("does not recover a submitted draft automatically, but can still find it", () => {
        const store = makeFormDraftStore(makeMemoryStorage(), { now: () => 1 });
        store.save({ formName: "f", formTitle: "F", status: "pending", data: { a: "x" } });
        store.markSubmitted("f");
        expect(store.recover("f")).toEqual(O.none);
        expect(store.find("f")).toEqual(O.some(expect.objectContaining({ status: "submitted" })));
    });

    it("recovers a submitted draft again once it is marked pending", () => {
        const store = makeFormDraftStore(makeMemoryStorage(), { now: () => 1 });
        store.save({ formName: "f", formTitle: "F", status: "submitted", data: { a: "x" } });
        expect(store.recover("f")).toEqual(O.none);
        store.markPending("f");
        expect(store.recover("f")).toEqual(O.some(expect.objectContaining({ data: { a: "x" } })));
    });

    it("clears a single form without touching the others", () => {
        const store = makeFormDraftStore(makeMemoryStorage(), { now: () => 1 });
        store.save({ formName: "a", formTitle: "A", status: "pending", data: { x: "1" } });
        store.save({ formName: "b", formTitle: "B", status: "pending", data: { x: "2" } });
        store.clear("a");
        expect(store.list().map((d) => d.formName)).toEqual(["b"]);
    });

    it("empties the storage when the last draft is gone", () => {
        const storage = makeMemoryStorage();
        const store = makeFormDraftStore(storage, { now: () => 1 });
        store.save({ formName: "a", formTitle: "A", status: "pending", data: { x: "1" } });
        store.clear("a");
        expect(storage.value).toBeNull();
    });

    it("stores nothing while disabled, but keeps previous drafts readable", () => {
        const storage = makeMemoryStorage();
        let enabled = true;
        const store = makeFormDraftStore(storage, { now: () => 1, isEnabled: () => enabled });
        store.save({ formName: "a", formTitle: "A", status: "pending", data: { x: "1" } });
        enabled = false;
        store.save({ formName: "b", formTitle: "B", status: "pending", data: { x: "2" } });
        expect(store.list().map((d) => d.formName)).toEqual(["a"]);
        expect(store.recover("a")).toEqual(O.none);
        expect(store.find("a")).toEqual(O.some(expect.objectContaining({ formName: "a" })));
    });

    it("drops expired drafts when pruned", () => {
        const storage = makeMemoryStorage();
        const store = makeFormDraftStore(storage, { now: () => 1 });
        store.save({ formName: "a", formTitle: "A", status: "pending", data: { x: "1" } });
        const later = makeFormDraftStore(storage, { now: () => DRAFT_MAX_AGE_MS + 2 });
        later.prune();
        expect(storage.value).toBeNull();
    });

    it("survives a corrupted storage payload", () => {
        const storage = makeMemoryStorage("💥");
        const store = makeFormDraftStore(storage, { now: () => 1 });
        expect(store.list()).toEqual([]);
        store.save({ formName: "a", formTitle: "A", status: "pending", data: { x: "1" } });
        expect(store.recover("a")).toEqual(O.some(expect.objectContaining({ formName: "a" })));
    });
});
