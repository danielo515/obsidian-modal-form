import { App } from "obsidian";

import { FormDefinition, FormModal } from "./FormModal";
import FormResult from "./FormResult";
import { exampleModalDefinition } from "./exampleModalDefinition";
import ModalFormPlugin from "main";
import { ModalFormError } from "./utils/Error";

export class API {
	/**
	 * Constructor for the API class
	 * @param {App} app - The application instance
	 * @param {ModalFormPlugin} plugin - The plugin instance
	 */
	constructor(private app: App, private plugin: ModalFormPlugin) { }

	/**
	 * Opens a modal form with the provided form definition
	 * @param {FormDefinition} formDefinition - The form definition to use
	 * @returns {Promise<FormResult>} - A promise that resolves with the form result
	 */
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

	/**
	 * Opens a named form
	 * @param {string} name - The name of the form to open
	 * @returns {Promise<FormResult>} - A promise that resolves with the form result
	 * @throws {ModalFormError} - Throws an error if the form definition is not found
	 */
	public namedForm(name: string): Promise<FormResult> {
		const formDefinition = this.plugin.settings?.formDefinitions.find(form => form.name === name);
		if (formDefinition) {
			return this.openModalForm(formDefinition);
		} else {
			throw new ModalFormError(`Form definition ${name} not found`);
		}
	}

	/**
	 * Opens a form with the provided form reference
	 * @param {string | FormDefinition} formReference - The form reference, either a form name of an existing form or an inline form definition
	 * @returns {Promise<FormResult>} - A promise that resolves with the form result
	 * @throws {ModalFormError} - Throws an error if the form reference is not found
	 */
	public openForm(formReference: string | FormDefinition): Promise<FormResult> {
		if (typeof formReference === "string") {
			return this.namedForm(formReference);
		} else {
			return this.openModalForm(formReference);
		}
	}
}

