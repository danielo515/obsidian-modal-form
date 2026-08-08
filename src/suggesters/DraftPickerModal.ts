import { App, FuzzySuggestModal } from "obsidian";
import type { FormDraft } from "src/core/formDrafts";

function describeDraft(draft: FormDraft): string {
    const when = new Date(draft.savedAt).toLocaleString();
    const fields = Object.keys(draft.data).length;
    const state = draft.status === "pending" ? "not submitted" : "submitted";
    return `${draft.formTitle} — ${fields} field${fields === 1 ? "" : "s"}, ${state}, ${when}`;
}

/** Lets the user pick one of the form drafts we kept around */
export class DraftPickerModal extends FuzzySuggestModal<FormDraft> {
    constructor(
        app: App,
        private drafts: FormDraft[],
        private onSelected: (draft: FormDraft) => void,
    ) {
        super(app);
        this.setPlaceholder("Pick the form data you want to recover");
    }

    getItems(): FormDraft[] {
        return this.drafts;
    }

    getItemText(item: FormDraft): string {
        return describeDraft(item);
    }

    onChooseItem(item: FormDraft, _: MouseEvent | KeyboardEvent): void {
        this.close();
        this.onSelected(item);
    }
}
