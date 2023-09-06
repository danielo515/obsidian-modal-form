import { App, Modal, Setting } from "obsidian";
import FormResult, { ModalFormData } from "./FormResult";
import { exhaustiveGuard } from "./safety";
import { FileSuggest } from "./suggestFile";
import { get_tfiles_from_folder } from "./utils/files";
type FieldType =
	| "text"
	| "number"
	| "date"
	| "time"
	| "datetime"
	| "toggle";

type inputType =
	| { type: FieldType }
	| { type: "note"; folder: string }
	| { type: "select"; source: "notes", folder: string }
	| {
		type: "select";
		source: "fixed";
		options: { value: string; label: string }[];
	};
/**
 * FormDefinition is a type that defines the structure of a form.
 * @param title - The title of the form which will appear as H1 heading in the form modal.
 * @param fields - An array of field objects, each representing a field in the form.
 * Each field object has the following properties:
 * @param name - The name of the field. This will be the key name in the resulting data returned
 * @param label - optinal label to show in the UI. If it does not exist, the name will be used.
 * @param description - A description of the field.
 * @param type - The type of the field. Can be one of "text", "number", "date", "time", "datetime", "toggle".
 */
export type FormDefinition = {
	title: string;
	fields: {
		name: string;
		label?: string;
		description: string;
		input: inputType;
	}[];
};
export type SubmitFn = (formResult: FormResult) => void;

export class FormModal extends Modal {
	modalDefinition: FormDefinition;
	formResult: ModalFormData;
	onSubmit: SubmitFn;
	constructor(app: App, modalDefinition: FormDefinition, onSubmit: SubmitFn) {
		super(app);
		this.modalDefinition = modalDefinition;
		this.onSubmit = onSubmit;
		this.formResult = {};
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
			switch (type) {
				case "text":
					return fieldBase.addText((text) =>
						text.onChange(async (value) => {
							this.formResult[definition.name] = value;
						})
					);
				case "number":
					return fieldBase.addText((text) => {
						text.inputEl.type = "number";
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
						text.onChange(async (value) => {
							this.formResult[definition.name] = value;
						});
					});
				case "time":
					return fieldBase.addText((text) => {
						text.inputEl.type = "time";
						text.onChange(async (value) => {
							this.formResult[definition.name] = value;
						});
					});
				case "datetime":
					return fieldBase.addText((text) => {
						text.inputEl.type = "datetime-local";
						text.onChange(async (value) => {
							this.formResult[definition.name] = value;
						});
					});
				case "toggle":
					return fieldBase.addToggle((toggle) =>
						toggle.onChange(async (value) => {
							this.formResult[definition.name] = value;
						})
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
									element.onChange(async (value) => {
										this.formResult[definition.name] =
											value;
									});
								});

							case "notes":
								return fieldBase.addDropdown((element) => {
									const files = get_tfiles_from_folder(fieldInput.folder);
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
		contentEl.empty();
		this.formResult = {};
	}
}
