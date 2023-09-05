import { App, Modal, Setting } from "obsidian";
import FormResult from "./FormResult";
type FieldType = "text" | "number" | "date" | "time" | "datetime";
export type FormDefinition = {
	title: string;
	fields: { name: string; description: string; type: FieldType }[];
};
export type SubmitFn = (formResult: FormResult) => void;

export class FormModal extends Modal {
	modalDefinition: FormDefinition;
	formResult: { [key: string]: string };
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
				.setName(definition.name)
				.setDesc(definition.description);
			switch (definition.type) {
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
					return fieldBase.addMomentFormat((moment) =>
						moment.onChange(async (value) => {
							this.formResult[definition.name] = value;
						})
					);
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
