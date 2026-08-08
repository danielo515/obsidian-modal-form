import { App, Modal, Setting } from "obsidian";

export type TemplateFailureChoice = "retry-form" | "edit-template" | "discard";

export type TemplateFailureOptions = {
    /** Short description of what could not be done, e.g. "The note could not be created" */
    title: string;
    /** The actual error, as close to the original wording as possible */
    message: string;
    /** Whether editing the rendered template by hand can help */
    canEditTemplate?: boolean;
};

/**
 * Tells the user exactly what went wrong after a form was already filled in,
 * and lets them pick how to recover. Whatever they choose, the data they
 * entered is never thrown away silently.
 */
class TemplateFailureModal extends Modal {
    private choice: TemplateFailureChoice = "discard";

    constructor(
        app: App,
        private options: TemplateFailureOptions,
        private onChoice: (choice: TemplateFailureChoice) => void,
    ) {
        super(app);
    }

    private choose(choice: TemplateFailureChoice) {
        this.choice = choice;
        this.close();
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass("modal-form-template-failure");
        contentEl.createEl("h2", { text: `🚨 ${this.options.title}` });
        contentEl.createEl("p", {
            text: "This is what went wrong:",
        });
        contentEl.createEl("pre", {
            text: this.options.message,
            cls: "modal-form-error-details",
        });
        contentEl.createEl("p", {
            text:
                "Nothing you typed has been lost. You can reopen the form with the same data, " +
                "or dismiss this and recover the data later with the " +
                '"Recover form data" command.',
        });

        const actions = new Setting(contentEl);
        actions.addButton((btn) =>
            btn.setButtonText("Discard").onClick(() => this.choose("discard")),
        );
        if (this.options.canEditTemplate) {
            actions.addButton((btn) =>
                btn.setButtonText("Fix the template").onClick(() => this.choose("edit-template")),
            );
        }
        actions.addButton((btn) =>
            btn
                .setButtonText("Reopen form")
                .setCta()
                .onClick(() => this.choose("retry-form")),
        );
    }

    onClose() {
        this.contentEl.empty();
        this.onChoice(this.choice);
    }
}

/** Opens the failure modal and resolves with whatever the user picked */
export function askTemplateFailure(
    app: App,
    options: TemplateFailureOptions,
): Promise<TemplateFailureChoice> {
    return new Promise((resolve) => {
        new TemplateFailureModal(app, options, resolve).open();
    });
}
