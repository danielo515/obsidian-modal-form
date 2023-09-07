import { App } from "obsidian";
import { FormDefinition, FormModal } from "./FormModal";
import FormResult from "./FormResult";
import { exampleModalDefinition } from "./exampleModalDefinition";
import ModalFormPlugin from "main";

export class API {
	constructor(private app: App, private plugin: ModalFormPlugin) { }
	openModalForm(formDefinition: FormDefinition): Promise<FormResult> {
		return new Promise((resolve) => {
			new FormModal(
				this.app,
				formDefinition,
				resolve
			).open();
		});
	}
	exampleForm(): Promise<FormResult> {
		return this.openModalForm(exampleModalDefinition)
	}
	openForm(name: string): Promise<FormResult> {
		const formDefinition = this.plugin.settings?.formDefinitions.find(form => form.name === name);
		if (formDefinition) {
			return this.openModalForm(formDefinition);
		} else {
			throw new Error(`Form definition ${name} not found`);
		}
	}
}
