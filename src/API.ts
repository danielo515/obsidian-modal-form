import { App } from "obsidian";

import type { FormDefinition } from "./core/formDefinition";
import FormResult from "./FormResult";
import { exampleModalDefinition } from "./exampleModalDefinition";
import ModalFormPlugin from "main";
import { ModalFormError } from "./utils/Error";
import { FormModal } from "./FormModal";
import { log_error } from "./utils/Log";

type pickOption = { pick: string[] }
type omitOption = { omit: string[] }
type limitOptions = { pick?: string[], omit?: string[] }

function isPickOption(opts: limitOptions): opts is pickOption {
	return 'pick' in opts && Array.isArray(opts.pick)
}
function isOmitOption(opts: limitOptions): opts is omitOption {
	return 'omit' in opts && Array.isArray(opts.omit)
}

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

	getFormByName(name: string): FormDefinition | undefined {
		return this.plugin.settings?.formDefinitions.find(form => form.name === name);
	}

	/**
	 * Opens a named form
	 * @param {string} name - The name of the form to open
	 * @returns {Promise<FormResult>} - A promise that resolves with the form result
	 * @throws {ModalFormError} - Throws an error if the form definition is not found
	 */
	public namedForm(name: string): Promise<FormResult> {
		const formDefinition = this.getFormByName(name)
		if (formDefinition) {
			return this.openModalForm(formDefinition);
		} else {
			const error = new ModalFormError(`Form definition ${name} not found`)
			log_error(error);
			return Promise.reject(error)
		}
	}

	public limitedForm(name: string, opts: limitOptions): Promise<FormResult> {
		const formDefinition = this.getFormByName(name)
		let newFormDefinition: FormDefinition;
		if (formDefinition) {
			if (isOmitOption(opts)) {
				const omit = opts.omit
				newFormDefinition = { ...formDefinition, fields: formDefinition.fields.filter(field => !omit.includes(field.name)) }
			} else if (isPickOption(opts)) {
				newFormDefinition = { ...formDefinition, fields: formDefinition.fields.filter(field => opts.pick.includes(field.name)) }
			} else {
				throw new ModalFormError('Invalid options provided to limitedForm', `GOT: ${JSON.stringify(opts)}`)
			}
			return this.openModalForm(newFormDefinition);
		} else {
			const error = new ModalFormError(`Form definition ${name} not found`)
			log_error(error);
			return Promise.reject(error)
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

