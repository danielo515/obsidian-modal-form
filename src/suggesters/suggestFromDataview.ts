import type { App } from "obsidian";
import { AbstractInputSuggest } from "obsidian";
import type { SafeDataviewQuery} from "./SafeDataviewQuery";
import { executeSandboxedDvQuery, sandboxedDvQuery } from "./SafeDataviewQuery";
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

    getSuggestions(inputStr: string): Promise<string[]> {
        const result = executeSandboxedDvQuery(this.sandboxedQuery, this.app);
        if (!inputStr) {
            return result();
        }
        const regex = createRegexFromInput(inputStr);
        return result().then((res) => res.filter((r) => regex.test(r)));
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
