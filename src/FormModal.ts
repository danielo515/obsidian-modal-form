import { App, Modal, Platform, Setting } from "obsidian";
import MultiSelect from "./views/components/MultiSelect.svelte";
import FormResult, {
    type ModalFormData,
} from "./core/FormResult";
import { formDataFromFormDefaults } from './core/formDataFromFormDefaults';
import { exhaustiveGuard } from "./safety";
import { get_tfiles_from_folder } from "./utils/files";
import type { FormDefinition, FormOptions } from "./core/formDefinition";
import { FileSuggest } from "./suggesters/suggestFile";
import { DataviewSuggest } from "./suggesters/suggestFromDataview";
import { SvelteComponent } from "svelte";
import {
    executeSandboxedDvQuery,
    sandboxedDvQuery,
} from "./suggesters/SafeDataviewQuery";
import { A, E, pipe, throttle } from "@std";
import { log_error, log_notice } from "./utils/Log";
import { FieldValue, FormEngine, makeFormEngine } from "./store/formStore";

export type SubmitFn = (formResult: FormResult) => void;

export class FormModal extends Modal {
    svelteComponents: SvelteComponent[] = [];
    initialFormValues: ModalFormData
    subscriptions: (() => void)[] = [];
    formEngine: FormEngine<FieldValue>;
    constructor(
        app: App,
        private modalDefinition: FormDefinition,
        private onSubmit: SubmitFn,
        options?: FormOptions,
    ) {
        super(app);
        this.initialFormValues = formDataFromFormDefaults(modalDefinition.fields, options?.values ?? {})
        this.formEngine = makeFormEngine((result) => {
            this.onSubmit(new FormResult(result, "ok"));
            this.close();
        }, this.initialFormValues);
    }

    // onOpen2() {
    //     const { contentEl } = this;
    //     const component = new FormModalComponent({
    //         target: contentEl,
    //         props: {
    //             onSubmit: this.onSubmit,
    //             formDefinition: this.modalDefinition,
    //         },
    //     });
    //     this.svelteComponents.push(component);
    // }
    onOpen() {
        const { contentEl } = this;
        // This class is very important for scoped styles
        contentEl.addClass('modal-form');
        if (this.modalDefinition.customClassname)
            contentEl.addClass(this.modalDefinition.customClassname);
        contentEl.createEl("h1", { text: this.modalDefinition.title });
        this.modalDefinition.fields.forEach((definition) => {
            const fieldBase = new Setting(contentEl)
                .setName(definition.label || definition.name)
                .setDesc(definition.description);
            // This intermediary constants are necessary so typescript can narrow down the proper types.
            // without them, you will have to use the whole access path (definition.input.folder),
            // and it is no specific enough when you use it in a switch statement.
            const fieldInput = definition.input;
            const type = fieldInput.type;
            const initialValue = this.initialFormValues[definition.name];
            const fieldStore = this.formEngine.addField(definition);
            const subToErrors = (
                input: HTMLInputElement | HTMLTextAreaElement,
            ) => {
                const notify = throttle((msg: string) => log_notice('The form has errors', msg), 2000)
                this.subscriptions.push(
                    fieldStore.errors.subscribe((errs) => {
                        errs.forEach(notify)
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
                        if (Platform.isIosApp)
                            textEl.inputEl.style.width = "100%";
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
                        initialValue !== undefined &&
                            text.setValue(String(initialValue));
                    });
                case "number":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "number";
                        subToErrors(text.inputEl);
                        text.onChange((val) => {
                            if (val !== "") {
                                fieldStore.value.set(Number(val) + "");
                            }
                        });
                        initialValue !== undefined &&
                            text.setValue(String(initialValue));
                    });
                case "datetime":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "datetime-local";
                        initialValue !== undefined &&
                            text.setValue(String(initialValue));
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
                    const source = fieldInput.source;
                    const options =
                        source == "fixed"
                            ? fieldInput.multi_select_options
                            : source == "notes"
                                ? pipe(
                                    get_tfiles_from_folder(
                                        fieldInput.folder,
                                        this.app,
                                    ),
                                    E.map(A.map((file) => file.basename)),
                                    E.getOrElse((err) => {
                                        log_error(err);
                                        return [] as string[];
                                    }),
                                )
                                : executeSandboxedDvQuery(
                                    sandboxedDvQuery(fieldInput.query),
                                    this.app,
                                );
                    this.svelteComponents.push(
                        new MultiSelect({
                            target: fieldBase.controlEl,
                            props: {
                                selectedVales: this.initialFormValues[
                                    definition.name
                                ] as string[] ?? [],
                                onChange: fieldStore.value.set,
                                availableOptions: options,
                                setting: fieldBase,
                                app: this.app,
                            },
                        }),
                    );
                    return;
                }
                case "tag": {
                    const options = Object.keys(
                        this.app.metadataCache.getTags(),
                    ).map((tag) => tag.slice(1)); // remove the #
                    this.svelteComponents.push(
                        new MultiSelect({
                            target: fieldBase.controlEl,
                            props: {
                                selectedVales: this.initialFormValues[
                                    definition.name
                                ] as string[] ?? [],
                                onChange: fieldStore.value.set,
                                availableOptions: options,
                                setting: fieldBase,
                                app: this.app,
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
                    });
                }
                case "select":
                    {
                        const source = fieldInput.source;
                        switch (source) {
                            case "fixed":
                                return fieldBase.addDropdown((element) => {
                                    fieldInput.options.forEach((option) => {
                                        element.addOption(
                                            option.value,
                                            option.label,
                                        );
                                    });
                                    fieldStore.value.set(element.getValue());
                                    element.onChange(fieldStore.value.set);
                                });

                            case "notes":
                                return fieldBase.addDropdown((element) => {
                                    const files = get_tfiles_from_folder(
                                        fieldInput.folder,
                                        this.app,
                                    );
                                    pipe(
                                        files,
                                        E.map((files) =>
                                            files.reduce(
                                                (
                                                    acc: Record<string, string>,
                                                    option,
                                                ) => {
                                                    acc[option.basename] =
                                                        option.basename;
                                                    return acc;
                                                },
                                                {},
                                            ),
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
                                exhaustiveGuard(source);
                        }
                    }
                    break;
                default:
                    return exhaustiveGuard(type);
            }
        });

        new Setting(contentEl).addButton((btn) =>
            btn
                .setButtonText("Submit")
                .setCta()
                .onClick(this.formEngine.triggerSubmit),
        );

        const submitEnterCallback = (evt: KeyboardEvent) => {
            if ((evt.ctrlKey || evt.metaKey) && evt.key === "Enter") {
                evt.preventDefault();
                this.formEngine.triggerSubmit();
            }
        };

        contentEl.addEventListener("keydown", submitEnterCallback);
    }

    onClose() {
        const { contentEl } = this;
        this.svelteComponents.forEach((component) => component.$destroy());
        this.subscriptions.forEach((subscription) => subscription());
        contentEl.empty();
        this.initialFormValues = {}
    }
}
