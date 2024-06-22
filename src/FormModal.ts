import { throttle } from "@std";
import { App, Modal, Setting } from "obsidian";
import { SvelteComponent } from "svelte";
import FormModalComponent from "./FormModal.svelte";
import FormResult, { type ModalFormData } from "./core/FormResult";
import { formDataFromFormDefaults } from "./core/formDataFromFormDefaults";
import type { FormDefinition, FormOptions } from "./core/formDefinition";
import { FormEngine, makeFormEngine } from "./store/formStore";
import { log_notice } from "./utils/Log";

export type SubmitFn = (formResult: FormResult) => void;

const notify = throttle(
    (msg: string) => log_notice("⚠️  The form has errors ⚠️", msg, "notice-warning"),
    2000,
);
const notifyError = (title: string) =>
    throttle((msg: string) => log_notice(`🚨 ${title} 🚨`, msg, "notice-error"), 2000);

export class FormModal extends Modal {
    svelteComponents: SvelteComponent[] = [];
    initialFormValues: ModalFormData;
    subscriptions: (() => void)[] = [];
    formEngine: FormEngine;
    constructor(
        app: App,
        private modalDefinition: FormDefinition,
        private onSubmit: SubmitFn,
        options?: FormOptions,
    ) {
        super(app);
        this.initialFormValues = formDataFromFormDefaults(
            modalDefinition.fields,
            options?.values ?? {},
        );
        this.formEngine = makeFormEngine({
            onSubmit: (result) => {
                this.onSubmit(FormResult.make(result, "ok"));
                this.close();
            },
            onCancel: () => {
                this.onSubmit(FormResult.make({}, "cancelled"));
                this.close();
            },
            defaultValues: this.initialFormValues,
        });
        // this.formEngine.subscribe(console.log);
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
                },
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
            // We  don't want to hande it if any modfier is pressed
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
        this.svelteComponents.forEach((component) => component.$destroy());
        this.subscriptions.forEach((subscription) => subscription());
        contentEl.empty();
        this.initialFormValues = {};
    }
}
