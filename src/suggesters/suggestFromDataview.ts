import { AbstractInputSuggest, App } from "obsidian";
import { SafeDataviewQuery, executeSandboxedDvQuery, sandboxedDvQuery } from "./SafeDataviewQuery";
import { createRegexFromInput } from "./createRegexFromInput";

/**
 * Offers suggestions based on a dataview query.
 * It requires the dataview plugin to be installed and enabled.
 * For now, we are not very strict with the checks and just throw errors
 */
export class DataviewSuggest extends AbstractInputSuggest<string> {
    sandboxedQuery: SafeDataviewQuery;

    constructor(
        public inputEl: HTMLInputElement,
        dvQuery: string,
        public app: App,
    ) {
        super(app, inputEl);
        this.sandboxedQuery = sandboxedDvQuery(dvQuery);
    }

    async getSuggestions(inputStr: string): Promise<string[]> {
        const result = await executeSandboxedDvQuery(this.sandboxedQuery, this.app);
        if (!inputStr) {
            return result;
        }
        const regex = createRegexFromInput(inputStr);
        return result.filter((r) => regex.test(r));
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
