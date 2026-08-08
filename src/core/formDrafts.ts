import { E, O, parse, pipe } from "@std";
import {
    array,
    literal,
    number,
    object,
    optional,
    string,
    union,
    unknown,
    type Output,
} from "valibot";
import { isPrimitive, isPrimitiveArray, type ModalFormData } from "./formResultTypes";

/**
 * Key used to store the drafts in Obsidian's vault scoped local storage.
 * Obsidian namespaces it per vault, so different vaults never share drafts.
 */
export const DRAFTS_STORAGE_KEY = "form-drafts";
/** Drafts older than this are dropped the next time the store is pruned */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
/** Upper bound of drafts we keep around, so local storage never grows unbounded */
export const MAX_STORED_DRAFTS = 25;

const DraftStatusSchema = union([literal("pending"), literal("submitted")]);
/**
 * `pending` means the data never made it out of the form, so it is safe to
 * offer it back automatically the next time the form is opened.
 * `submitted` means the form was submitted, but we keep the data around for a
 * while because whatever consumed it (a template, a templater command, a user
 * script) may still fail after the modal is gone.
 */
export type DraftStatus = Output<typeof DraftStatusSchema>;

const FormDraftSchema = object({
    formName: string(),
    fieldsKey: optional(string(), ""),
    formTitle: optional(string(), ""),
    savedAt: number(),
    status: optional(DraftStatusSchema, "pending"),
    // Validated by `sanitizeDraftData` instead, so a single corrupted value
    // does not throw away the whole draft.
    data: optional(unknown(), {}),
});

const DraftsEnvelopeSchema = object({
    version: optional(number(), 1),
    drafts: optional(array(FormDraftSchema), []),
});

/**
 * What identifies a draft.
 *
 * A form name alone is not enough, for two reasons:
 *
 * - `limitedForm` hands out definitions that keep the name of the original
 *   form but only carry some of its fields. If both shared a draft, filling
 *   the limited variant would quietly truncate what was saved for the full
 *   one, and cancelling it would delete the lot.
 * - A field can keep its name and change its input type. Values saved under
 *   the old type do not necessarily fit the new one, and restoring them would
 *   put the form in a state the user never typed.
 *
 * So the identity covers the shape of the form, not just its name.
 */
export interface DraftId {
    formName: string;
    /** Identifies the fields the form that owns the draft has, and their types */
    fieldsKey: string;
}

export interface FormDraft extends DraftId {
    formTitle: string;
    savedAt: number;
    status: DraftStatus;
    data: ModalFormData;
}

export type NewFormDraft = Omit<FormDraft, "savedAt">;

export type DraftFieldShape = { name: string; input?: { type?: string } };

/** Stable regardless of the order the fields come in */
export function draftFieldsKey(fields: readonly DraftFieldShape[]): string {
    return JSON.stringify(fields.map((field) => `${field.name}:${field.input?.type ?? ""}`).sort());
}

export function draftIdFor(form: { name: string; fields: readonly DraftFieldShape[] }): DraftId {
    return { formName: form.name, fieldsKey: draftFieldsKey(form.fields) };
}

function isSameDraft(a: DraftId, b: DraftId): boolean {
    return a.formName === b.formName && a.fieldsKey === b.fieldsKey;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Keeps only the values we know how to serialize and read back.
 * Anything else (a FileProxy, a nested object, a function) is dropped rather
 * than making the whole draft unusable.
 */
export function sanitizeDraftData(values: Record<string, unknown>): ModalFormData {
    const result: ModalFormData = {};
    for (const [key, value] of Object.entries(values)) {
        if (isPrimitiveArray(value) || isPrimitive(value)) {
            result[key] = value;
        }
    }
    return result;
}

/**
 * Tells apart a draft worth recovering from the empty shell a form produces
 * just by being opened (toggles default to `false`, everything else is absent).
 */
export function draftHasContent(data: ModalFormData): boolean {
    return Object.values(data).some((value) => {
        if (typeof value === "string") return value.length > 0;
        if (typeof value === "boolean") return value;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    });
}

/** Reads whatever local storage returned, discarding anything malformed */
export function parseDrafts(raw: unknown): FormDraft[] {
    if (raw === null || raw === undefined) return [];
    return pipe(
        parse(DraftsEnvelopeSchema, raw),
        E.map(({ drafts }) =>
            drafts.map(
                (draft): FormDraft => ({
                    formName: draft.formName,
                    fieldsKey: draft.fieldsKey,
                    formTitle: draft.formTitle || draft.formName,
                    savedAt: draft.savedAt,
                    status: draft.status,
                    data: sanitizeDraftData(isRecord(draft.data) ? draft.data : {}),
                }),
            ),
        ),
        E.getOrElseW((): FormDraft[] => []),
    );
}

/** Newest first, expired and excess drafts removed */
export function pruneDrafts(
    drafts: FormDraft[],
    now: number,
    maxAge = DRAFT_MAX_AGE_MS,
    maxEntries = MAX_STORED_DRAFTS,
): FormDraft[] {
    return [...drafts]
        .sort((a, b) => b.savedAt - a.savedAt)
        .filter((draft) => now - draft.savedAt <= maxAge)
        .slice(0, maxEntries);
}

export function upsertDraft(drafts: FormDraft[], draft: FormDraft): FormDraft[] {
    return [draft, ...drafts.filter((d) => !isSameDraft(d, draft))];
}

export function findDraft(drafts: FormDraft[], id: DraftId): O.Option<FormDraft> {
    return O.fromNullable(drafts.find((draft) => isSameDraft(draft, id)));
}

/**
 * The bit of the outside world the draft store needs.
 * Implemented on top of Obsidian's vault scoped local storage, but kept as an
 * interface so it can be exercised in tests without an Obsidian app.
 */
export interface DraftStorage {
    load(): unknown;
    save(value: unknown | null): void;
}

export interface FormDraftStore {
    /** Stores (or replaces) the draft of a form */
    save(draft: NewFormDraft): void;
    /** The draft of a form, only if it is worth restoring automatically */
    recover(id: DraftId): O.Option<FormDraft>;
    /** The draft of a form, whatever its status */
    find(id: DraftId): O.Option<FormDraft>;
    /** All stored drafts, newest first */
    list(): FormDraft[];
    /** Flags the draft as submitted, so it is no longer restored automatically */
    markSubmitted(id: DraftId): void;
    /** Flags the draft as pending again, so the next open of the form restores it */
    markPending(id: DraftId): void;
    clear(id: DraftId): void;
    clearAll(): void;
    /** Drops expired and excess drafts */
    prune(): void;
}

type MakeFormDraftStoreOptions = {
    now?: () => number;
    /** When drafts are disabled nothing new is stored, but stored drafts stay recoverable */
    isEnabled?: () => boolean;
};

export function makeFormDraftStore(
    storage: DraftStorage,
    { now = () => Date.now(), isEnabled = () => true }: MakeFormDraftStoreOptions = {},
): FormDraftStore {
    function read(): FormDraft[] {
        return parseDrafts(storage.load());
    }
    function write(drafts: FormDraft[]): void {
        const pruned = pruneDrafts(drafts, now());
        if (pruned.length === 0) {
            storage.save(null);
            return;
        }
        storage.save({ version: 1, drafts: pruned });
    }
    function setStatus(id: DraftId, status: DraftStatus): void {
        const drafts = read();
        if (!drafts.some((draft) => isSameDraft(draft, id))) return;
        write(drafts.map((draft) => (isSameDraft(draft, id) ? { ...draft, status } : draft)));
    }
    function clear(id: DraftId): void {
        const drafts = read();
        if (!drafts.some((draft) => isSameDraft(draft, id))) return;
        write(drafts.filter((draft) => !isSameDraft(draft, id)));
    }
    return {
        save(draft) {
            if (!isEnabled()) return;
            const data = sanitizeDraftData(draft.data);
            if (!draftHasContent(data)) {
                // An empty draft is noise, and it would shadow a previous
                // useful one for the same form.
                clear(draft);
                return;
            }
            write(upsertDraft(read(), { ...draft, data, savedAt: now() }));
        },
        recover(id) {
            if (!isEnabled()) return O.none;
            return pipe(
                findDraft(read(), id),
                O.filter((draft) => draft.status === "pending" && draftHasContent(draft.data)),
            );
        },
        find(id) {
            return findDraft(read(), id);
        },
        list() {
            return pruneDrafts(read(), now());
        },
        markSubmitted(id) {
            setStatus(id, "submitted");
        },
        markPending(id) {
            setStatus(id, "pending");
        },
        clear,
        clearAll() {
            storage.save(null);
        },
        prune() {
            const drafts = read();
            if (drafts.length === 0) return;
            write(drafts);
        },
    };
}

/** A draft store that does nothing, useful as a default and in tests */
export function makeNoopDraftStore(): FormDraftStore {
    return {
        save() {},
        recover: () => O.none,
        find: () => O.none,
        list: () => [],
        markSubmitted() {},
        markPending() {},
        clear() {},
        clearAll() {},
        prune() {},
    };
}
