import { AbstractInputSuggest, App } from "obsidian";
import { SafeDataviewQuery, executeSandboxedDvQuery, sandboxedDvQuery } from "./SafeDataviewQuery";

/**
 * Offers suggestions based on a dataview query.
 * It requires the dataview plugin to be installed and enabled.
 * For now, we are not very strict with the checks and just throw errors
 */
export class DataviewSuggest extends AbstractInputSuggest<string> {
    sandboxedQuery: SafeDataviewQuery

    constructor(
        public inputEl: HTMLInputElement,
        dvQuery: string,
        public app: App,
    ) {
        super(app, inputEl);
        this.sandboxedQuery = sandboxedDvQuery(dvQuery)
    }

    getSuggestions(inputStr: string): string[] {
        const result = executeSandboxedDvQuery(this.sandboxedQuery, this.app)
        return result.filter((r) => r.toLowerCase().includes(inputStr.toLowerCase()))
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
