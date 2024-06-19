import { E, absurd, parseFunctionBody, pipe, throttle } from "@std";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";
import { App, Modal, Platform, Setting, sanitizeHTMLToDom } from "obsidian";
import { SvelteComponent } from "svelte";
import { Writable } from "svelte/store";
import FormModalComponent from "./FormModal.svelte";
import FormResult, { type ModalFormData } from "./core/FormResult";
import { formDataFromFormDefaults } from "./core/formDataFromFormDefaults";
import type { FormDefinition, FormOptions } from "./core/formDefinition";
import { FieldValue, FormEngine, makeFormEngine } from "./store/formStore";
import { FileSuggest } from "./suggesters/suggestFile";
import { FolderSuggest } from "./suggesters/suggestFolder";
import { DataviewSuggest } from "./suggesters/suggestFromDataview";
import { log_error, log_notice } from "./utils/Log";
import { get_tfiles_from_folder } from "./utils/files";
import MultiSelect from "./views/components/MultiSelect.svelte";
import { MultiSelectModel, MultiSelectTags } from "./views/components/MultiSelectModel";

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
        this.modalDefinition.fields.forEach((definition) => {
            const name = definition.label || definition.name;
            const required = definition.isRequired ?? false;
            const fieldBase = new Setting(contentEl)
                .setName(`${name} ${required ? "*" : ""}`.trim())
                .setDesc(definition.description);
            // This intermediary constants are necessary so typescript can narrow down the proper types.
            // without them, you will have to use the whole access path (definition.input.folder),
            // and it is no specific enough when you use it in a switch statement.
            const fieldInput = definition.input;
            const type = fieldInput.type;
            const initialValue = this.initialFormValues[definition.name];
            const fieldStore = this.formEngine.addField(definition);
            const subToErrors = (input: HTMLInputElement | HTMLTextAreaElement) => {
                this.subscriptions.push(
                    fieldStore.errors.subscribe((errs) => {
                        errs.length > 0 ? console.log("errors", errs) : void 0;
                        errs.forEach(notify);
                        input.setCustomValidity(errs.join("\n"));
                    }),
                );
            };
            switch (type) {
                case "textarea": {
                    fieldBase.setClass("modal-form-textarea");
                    return fieldBase.addTextArea((textEl) => {
                        textEl.onChange(fieldStore.value.set);
                        subToErrors(textEl.inputEl);
                        if (typeof initialValue === "string") {
                            textEl.setValue(initialValue);
                        }
                        textEl.inputEl.rows = 6;
                        if (Platform.isIosApp) textEl.inputEl.style.width = "100%";
                        else if (Platform.isDesktopApp) {
                            textEl.inputEl.rows = 10;
                        }
                    });
                }
                case "email":
                case "tel":
                case "date":
                case "time":
                case "text":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = type;
                        subToErrors(text.inputEl);
                        text.onChange(fieldStore.value.set);
                        initialValue !== undefined && text.setValue(String(initialValue));
                    });
                case "number":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "number";
                        text.inputEl.step = "any";
                        subToErrors(text.inputEl);
                        text.onChange((val) => {
                            if (val !== "") {
                                fieldStore.value.set(Number(val) + "");
                            }
                        });
                        initialValue !== undefined && text.setValue(String(initialValue));
                    });
                case "datetime":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "datetime-local";
                        initialValue !== undefined && text.setValue(String(initialValue));
                        subToErrors(text.inputEl);
                        text.onChange(fieldStore.value.set);
                    });
                case "toggle":
                    return fieldBase.addToggle((toggle) => {
                        toggle.setValue(!!initialValue);
                        return toggle.onChange(fieldStore.value.set);
                    });
                case "note":
                    return fieldBase.addText((element) => {
                        new FileSuggest(
                            this.app,
                            element.inputEl,
                            {
                                renderSuggestion(file) {
                                    return file.basename;
                                },
                                selectSuggestion(file) {
                                    return file.basename;
                                },
                            },
                            fieldInput.folder,
                        );
                        subToErrors(element.inputEl);
                        element.onChange(fieldStore.value.set);
                    });
                case "folder":
                    return fieldBase.addText((element) => {
                        new FolderSuggest(element.inputEl, this.app);
                        subToErrors(element.inputEl);
                        element.onChange(fieldStore.value.set);
                    });
                case "slider":
                    return fieldBase.addSlider((slider) => {
                        slider.setLimits(fieldInput.min, fieldInput.max, 1);
                        slider.setDynamicTooltip();
                        if (typeof initialValue === "number") {
                            slider.setValue(initialValue);
                        } else {
                            slider.setValue(fieldInput.min);
                        }
                        slider.onChange(fieldStore.value.set);
                    });
                case "multiselect": {
                    fieldStore.value.set(initialValue ?? []);
                    this.svelteComponents.push(
                        new MultiSelect({
                            target: fieldBase.controlEl,
                            props: {
                                model: MultiSelectModel(
                                    fieldInput,
                                    this.app,
                                    fieldStore.value as Writable<string[]>,
                                ),
                                values: fieldStore.value as Writable<string[]>,
                                errors: fieldStore.errors,
                                setting: fieldBase,
                            },
                        }),
                    );
                    return;
                }
                case "tag": {
                    fieldStore.value.set(initialValue ?? []);
                    this.svelteComponents.push(
                        new MultiSelect({
                            target: fieldBase.controlEl,
                            props: {
                                values: fieldStore.value as Writable<string[]>,
                                setting: fieldBase,
                                errors: fieldStore.errors,
                                model: Promise.resolve(
                                    MultiSelectTags(
                                        fieldInput,
                                        this.app,
                                        fieldStore.value as Writable<string[]>,
                                    ),
                                ),
                            },
                        }),
                    );
                    return;
                }
                case "dataview": {
                    const query = fieldInput.query;
                    return fieldBase.addText((element) => {
                        new DataviewSuggest(element.inputEl, query, this.app);
                        element.onChange(fieldStore.value.set);
                        subToErrors(element.inputEl);
                    });
                }
                case "select": {
                    const source = fieldInput.source;
                    switch (source) {
                        case "fixed":
                            return fieldBase.addDropdown((element) => {
                                fieldInput.options.forEach((option) => {
                                    element.addOption(option.value, option.label);
                                });
                                initialValue !== undefined &&
                                    element.setValue(String(initialValue));
                                fieldStore.value.set(element.getValue());
                                element.onChange(fieldStore.value.set);
                            });

                        case "notes":
                            return fieldBase.addDropdown((element) => {
                                const files = get_tfiles_from_folder(fieldInput.folder, this.app);
                                pipe(
                                    files,
                                    E.map((files) =>
                                        files.reduce((acc: Record<string, string>, option) => {
                                            acc[option.basename] = option.basename;
                                            return acc;
                                        }, {}),
                                    ),
                                    E.mapLeft((err) => {
                                        log_error(err);
                                        return err;
                                    }),
                                    E.map((options) => {
                                        element.addOptions(options);
                                    }),
                                );
                                fieldStore.value.set(element.getValue());
                                element.onChange(fieldStore.value.set);
                            });
                        default:
                            absurd(source);
                    }
                    break;
                }
                case "document_block": {
                    const functionBody = fieldInput.body;
                    const functionParsed = parseFunctionBody<[Record<string, FieldValue>], string>(
                        functionBody,
                        "form",
                    );
                    const domNode = fieldBase.infoEl.createDiv();
                    const sub = this.formEngine.subscribe((form) => {
                        pipe(
                            functionParsed,
                            TE.fromEither,
                            TE.chainW((fn) =>
                                pipe(
                                    form.fields,
                                    R.filterMap((field) => field.value),
                                    fn,
                                ),
                            ),
                            TE.match(
                                (error) => {
                                    console.error(error);
                                    notifyError("Error in document block")(String(error));
                                },
                                (newText) => domNode.setText(sanitizeHTMLToDom(newText)),
                            ),
                        )();
                    });
                    return this.subscriptions.push(sub);
                }

                default:
                    return absurd(type);
            }
        });

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
