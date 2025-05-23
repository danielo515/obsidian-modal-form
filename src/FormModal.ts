import { throttle } from "@std";
import { App, Modal, Setting } from "obsidian";
import { SvelteComponent } from "svelte";
import FormModalComponent from "./FormModal.svelte";
import FormResult, { type ModalFormData } from "./core/FormResult";
import { formDataFromFormDefaults } from "./core/formDataFromFormDefaults";
import type { FormDefinition, FormOptions } from "./core/formDefinition";
import { FormEngine, makeFormEngine } from "./store/formEngine";
import { log_notice } from "./utils/Log";

export type SubmitFn = (formResult: FormResult) => void;

const notify = throttle(
    (msg: string[]) => log_notice("⚠️  The form has errors ⚠️", msg.join("\n"), "notice-warning"),
    2000,
);
export class FormModal extends Modal {
    svelteComponents: SvelteComponent[] = [];
    initialFormValues: ModalFormData;
    subscriptions: (() => void)[] = [];
    formEngine: FormEngine;
    private hasBeenHandled = false;
    
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
                this.hasBeenHandled = true;
                this.onSubmit(FormResult.make(result, "ok"));
                super.close();
            },
            onCancel: () => {
                this.hasBeenHandled = true;
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
        this.svelteComponents.forEach((component) => component.$destroy());
        this.subscriptions.forEach((subscription) => subscription());
        contentEl.empty();
        this.initialFormValues = {};
    }
}
