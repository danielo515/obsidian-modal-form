import { App, Modal, Platform, Setting } from "obsidian";
import MultiSelect from "./views/components/MultiSelect.svelte";
import FormResult, { formDataFromFormOptions, type ModalFormData } from "./FormResult";
import { exhaustiveGuard } from "./safety";
import { get_tfiles_from_folder } from "./utils/files";
import type { FormDefinition, FormOptions } from "./core/formDefinition";
import { FileSuggest } from "./suggesters/suggestFile";
import { DataviewSuggest } from "./suggesters/suggestFromDataview";
import { SvelteComponent } from "svelte";

export type SubmitFn = (formResult: FormResult) => void;

export class FormModal extends Modal {
    formResult: ModalFormData;
    svelteComponents: SvelteComponent[] = [];
    constructor(app: App, private modalDefinition: FormDefinition, private onSubmit: SubmitFn, options?: FormOptions) {
        super(app);
        this.formResult = {};
        if (options?.values) {
            this.formResult = formDataFromFormOptions(options.values)
        }
    }

    onOpen() {
        const { contentEl } = this;
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
            const initialValue = this.formResult[definition.name];
            switch (type) {
                case "textarea":
                    fieldBase.setClass('modal-form-textarea')
                    return fieldBase.addTextArea((textEl) => {
                        textEl.onChange(value => {

                            this.formResult[definition.name] = value;
                        });
                        textEl.inputEl.rows = 6;
                        if (Platform.isIosApp)
                            textEl.inputEl.style.width = "100%";
                        else if (Platform.isDesktopApp) {
                            textEl.inputEl.rows = 10;
                        }
                    })
                case "text":
                    return fieldBase.addText((text) => {
                        initialValue !== undefined && text.setValue(String(initialValue));
                        return text.onChange(async (value) => {
                            this.formResult[definition.name] = value;
                        });
                    }
                    );
                case "number":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "number";
                        initialValue !== undefined && text.setValue(String(initialValue));
                        text.onChange(async (value) => {
                            if (value !== "") {
                                this.formResult[definition.name] =
                                    Number(value) + "";
                            }
                        });
                    });
                case "date":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "date";
                        initialValue !== undefined && text.setValue(String(initialValue));
                        text.onChange(async (value) => {
                            this.formResult[definition.name] = value;
                        });
                    });
                case "time":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "time";
                        initialValue !== undefined && text.setValue(String(initialValue));
                        text.onChange(async (value) => {
                            this.formResult[definition.name] = value;
                        });
                    });
                case "datetime":
                    return fieldBase.addText((text) => {
                        text.inputEl.type = "datetime-local";
                        initialValue !== undefined && text.setValue(String(initialValue));
                        text.onChange(async (value) => {
                            this.formResult[definition.name] = value;
                        });
                    });
                case "toggle":
                    return fieldBase.addToggle((toggle) => {
                        toggle.setValue(!!initialValue);
                        this.formResult[definition.name] = !!initialValue;
                        return toggle.onChange(async (value) => {
                            this.formResult[definition.name] = value;
                        });
                    }
                    );
                case "note":
                    return fieldBase.addText((element) => {
                        new FileSuggest(this.app, element.inputEl, {
                            renderSuggestion(file) {
                                return file.basename;
                            },
                            selectSuggestion(file) {
                                return file.basename;
                            },
                        }, fieldInput.folder);
                        element.onChange(async (value) => {
                            this.formResult[definition.name] = value;
                        });
                    });
                case "slider":
                    return fieldBase.addSlider((slider) => {
                        slider.setLimits(fieldInput.min, fieldInput.max, 1);
                        slider.setDynamicTooltip();
                        if (typeof initialValue === 'number') {
                            slider.setValue(initialValue)
                        } else {
                            slider.setValue(fieldInput.min);
                        }
                        slider.onChange(async (value) => {
                            this.formResult[definition.name] = value;
                        });
                    });
                case 'multiselect':
                    {
                        this.formResult[definition.name] = this.formResult[definition.name] || []
                        const options = fieldInput.source == 'fixed'
                            ? fieldInput.options
                            : get_tfiles_from_folder(fieldInput.folder, this.app).map(file => file.basename);
                        this.svelteComponents.push(new MultiSelect({
                            target: fieldBase.controlEl,
                            props: {
                                selectedVales: this.formResult[definition.name] as string[],
                                availableOptions: options,
                                setting: fieldBase,
                            }
                        }))
                        return;
                    }
                case "dataview":
                    {
                        const query = fieldInput.query;
                        return fieldBase.addText((element) => {
                            new DataviewSuggest(element.inputEl, query, this.app);
                            element.onChange(async (value) => {
                                this.formResult[definition.name] = value;
                            });
                        });
                    }
                case "select":
                    {
                        const source = fieldInput.source;
                        switch (source) {
                            case "fixed":
                                return fieldBase.addDropdown((element) => {
                                    const options = fieldInput.options.reduce(
                                        (
                                            acc: Record<string, string>,
                                            option
                                        ) => {
                                            acc[option.value] = option.label;
                                            return acc;
                                        },
                                        {}
                                    );
                                    element.addOptions(options);
                                    this.formResult[definition.name] = element.getValue();
                                    element.onChange(async (value) => {
                                        this.formResult[definition.name] =
                                            value;
                                    });
                                });

                            case "notes":
                                return fieldBase.addDropdown((element) => {
                                    const files = get_tfiles_from_folder(fieldInput.folder, this.app);
                                    const options = files.reduce(
                                        (
                                            acc: Record<string, string>,
                                            option
                                        ) => {
                                            acc[option.basename] =
                                                option.basename;
                                            return acc;
                                        },
                                        {}
                                    );
                                    element.addOptions(options);
                                    this.formResult[definition.name] = element.getValue();
                                    element.onChange(async (value) => {
                                        this.formResult[definition.name] =
                                            value;
                                    });
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
                .onClick(() => {
                    this.onSubmit(new FormResult(this.formResult, "ok"));
                    this.close();
                })
        );
    }

    onClose() {
        const { contentEl } = this;
        this.svelteComponents.forEach(component => component.$destroy())
        contentEl.empty();
        this.formResult = {};
    }
}
