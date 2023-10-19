import { AbstractInputSuggest, App } from "obsidian";
import { ModalFormError, tryCatch } from "src/utils/Error";
import { log_error } from "src/utils/Log";

/**
 * Offers suggestions based on a dataview query.
 * It requires the dataview plugin to be installed and enabled.
 * For now, we are not very strict with the checks and just throw errors
 */
export class DataviewSuggest extends AbstractInputSuggest<string> {
    sandboxedQuery: (dv: any, pages: any) => string[]

    constructor(
        public inputEl: HTMLInputElement,
        dvQuery: string,
        public app: App,
    ) {
        super(app, inputEl);
        this.sandboxedQuery = tryCatch(
            () => eval(`(function sandboxedQuery(dv, pages) { return ${dvQuery} })`),
            "Invalid dataview query"
        )
    }

    getSuggestions(inputStr: string): string[] {
        const dv = this.app.plugins.plugins.dataview?.api
        if (!dv) {
            log_error(new ModalFormError("Dataview plugin is not enabled"))
            return [];
        }
        const result = this.sandboxedQuery(dv, dv.pages)
        if (!Array.isArray(result)) {
            log_error(new ModalFormError("The dataview query did not return an array"))
            return [];
        }
        return result.filter(r => r.toLowerCase().includes(inputStr.toLowerCase()))
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
