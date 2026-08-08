import { debounce, O, pipe, throttle, type Debounced } from "@std";
import { App, Modal, Setting } from "obsidian";
import { SvelteComponent } from "svelte";
import FormModalComponent from "./FormModal.svelte";
import FormResult from "./core/FormResult";
import { formDataFromFormDefaults } from "./core/formDataFromFormDefaults";
import type { FormDefinition, FormOptions } from "./core/formDefinition";
import {
    draftIdFor,
    makeNoopDraftStore,
    sanitizeDraftData,
    type DraftId,
    type FormDraftStore,
} from "./core/formDrafts";
import type { ModalFormData } from "./core/formResultTypes";
import { FormEngine, makeFormEngine } from "./store/formEngine";
import { log_notice } from "./utils/Log";

export type SubmitFn = (formResult: FormResult) => void;

/** How long we wait after the last keystroke before writing the draft */
const DRAFT_SAVE_DELAY_MS = 400;

const notify = throttle(
    (msg: string[]) => log_notice("⚠️  The form has errors ⚠️", msg.join("\n"), "notice-warning"),
    2000,
);

function describeAge(millis: number): string {
    const minutes = Math.round(millis / 60000);
    if (minutes < 1) return "a moment ago";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
}

export class FormModal extends Modal {
    svelteComponents: SvelteComponent[] = [];
    initialFormValues: ModalFormData;
    subscriptions: (() => void)[] = [];
    formEngine: FormEngine;
    private hasBeenHandled = false;
    private drafts: FormDraftStore;
    private draftId: DraftId;
    private persistDraft: Debounced<[]>;

    constructor(
        app: App,
        private modalDefinition: FormDefinition,
        private onSubmit: SubmitFn,
        options?: FormOptions,
        drafts: FormDraftStore = makeNoopDraftStore(),
    ) {
        super(app);
        // Throwaway opens such as previews must not leave anything behind, nor
        // pick up a draft that belongs to a real use of the same form.
        this.drafts = options?.preserveData === false ? makeNoopDraftStore() : drafts;
        this.draftId = draftIdFor(modalDefinition);
        // Values passed by the caller always win over a recovered draft:
        // they are an explicit intent, the draft is a leftover.
        const recovered = this.drafts.recover(this.draftId);
        const recoveredValues = pipe(
            recovered,
            O.map((draft) => draft.data),
            O.getOrElse((): ModalFormData => ({})),
        );
        this.initialFormValues = formDataFromFormDefaults(modalDefinition.fields, {
            ...recoveredValues,
            ...(options?.values ?? {}),
        });
        if (O.isSome(recovered)) {
            log_notice(
                "↩️ Recovered unsaved form data",
                `We restored what you had typed in "${modalDefinition.title}" ` +
                    `${describeAge(Date.now() - recovered.value.savedAt)}. ` +
                    "Cancel the form if you would rather start from scratch.",
            );
        }
        this.persistDraft = debounce(() => {
            this.drafts.save({
                ...this.draftId,
                formTitle: this.modalDefinition.title,
                status: "pending",
                data: sanitizeDraftData(this.formEngine.getValues()),
            });
        }, DRAFT_SAVE_DELAY_MS);
        this.formEngine = makeFormEngine({
            onSubmit: (result) => {
                this.hasBeenHandled = true;
                this.persistDraft.cancel();
                // The data made it out of the form, but whatever consumes it
                // may still fail, so we keep the draft around instead of
                // deleting it. It just stops being restored automatically.
                this.drafts.save({
                    ...this.draftId,
                    formTitle: this.modalDefinition.title,
                    status: "submitted",
                    data: sanitizeDraftData(result),
                });
                this.onSubmit(FormResult.make(result, "ok"));
                super.close();
            },
            onCancel: () => {
                this.hasBeenHandled = true;
                // Cancelling is an explicit "I don't want this", so the draft goes away
                this.persistDraft.cancel();
                this.drafts.clear(this.draftId);
                this.onSubmit(FormResult.make({}, "cancelled"));
                super.close();
            },
            defaultValues: this.initialFormValues,
        });
        // this.formEngine.subscribe(console.log);
    }

    // Override the close method to handle X button and outside clicks
    close() {
        if (!this.hasBeenHandled) {
            this.hasBeenHandled = true;
            // Closing without cancelling is the accidental case, so make sure
            // the very last edit is stored before the modal goes away.
            this.persistDraft.flush();
            this.onSubmit(FormResult.make({}, "cancelled"));
        }
        super.close();
    }

    onOpen() {
        const { contentEl } = this;
        // This class is very important for scoped styles
        contentEl.addClass("modal-form");
        if (this.modalDefinition.customClassname)
            contentEl.addClass(this.modalDefinition.customClassname);
        contentEl.createEl("h1", { text: this.modalDefinition.title });
        this.svelteComponents.push(
            new FormModalComponent({
                target: contentEl,
                props: {
                    formEngine: this.formEngine,
                    fields: this.modalDefinition.fields,
                    app: this.app,
                    reportFormErrors: notify,
                },
            }),
        );

        // Subscribing after the fields have been registered by the component
        // avoids storing a draft of a form that has no fields yet.
        this.subscriptions.push(
            this.formEngine.subscribe(() => {
                if (this.hasBeenHandled) return;
                this.persistDraft();
            }),
        );

        const buttons = new Setting(contentEl).addButton((btn) =>
            btn.setButtonText("Cancel").onClick(this.formEngine.triggerCancel),
        );

        buttons.addButton((btn) =>
            btn.setButtonText("Submit").setCta().onClick(this.formEngine.triggerSubmit),
        );

        const submitEnterCallback = (evt: KeyboardEvent) => {
            if ((evt.ctrlKey || evt.metaKey) && evt.key === "Enter") {
                evt.preventDefault();
                this.formEngine.triggerSubmit();
            }
        };

        const cancelEscapeCallback = (evt: KeyboardEvent) => {
            // We  don't want to handle it if any modifier is pressed
            if (!(evt.ctrlKey || evt.metaKey) && evt.key === "Escape") {
                evt.preventDefault();
                this.formEngine.triggerCancel();
            }
        };

        contentEl.addEventListener("keydown", submitEnterCallback);
        contentEl.addEventListener("keydown", cancelEscapeCallback);
    }

    onClose() {
        const { contentEl } = this;
        this.persistDraft.cancel();
        this.svelteComponents.forEach((component) => component.$destroy());
        this.subscriptions.forEach((subscription) => subscription());
        contentEl.empty();
        this.initialFormValues = {};
    }
}
