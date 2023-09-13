// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes
import { App, TAbstractFile, TFolder } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { ModalFormError } from "src/utils/Error";

/**
 * Offers suggestions based on a dataview query.
 * It requires the dataview plugin to be installed and enabled.
 * For now, we are not very strict with the checks and just throw errors
 */
export class DataviewSuggest extends TextInputSuggest<string> {
	sandboxedQuery: (dv: any, pages: any) => string[]

	constructor(
		public inputEl: HTMLInputElement,
		private dvQuery: string,
		protected app: App,
	) {
		super(app, inputEl);
		this.sandboxedQuery = eval(`(function sandboxedQuery(dv, pages) { return ${dvQuery} })`)

	}

	getSuggestions(inputStr: string): string[] {
		const dv = this.app.plugins.plugins.dataview?.api
		if (!dv) {
			throw new ModalFormError("Dataview plugin is not enabled")
		}
		const result = this.sandboxedQuery(dv, dv.pages)
		if (!Array.isArray(result)) {
			throw new ModalFormError("The dataview query did not return an array")
		}
		return result
	}

	renderSuggestion(option: string, el: HTMLElement): void {
		el.setText(option);
	}

	selectSuggestion(option: string): void {
		this.inputEl.value = option;
		this.inputEl.trigger("input");
		this.close();
	}
}
