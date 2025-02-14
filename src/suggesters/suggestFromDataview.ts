import { AbstractInputSuggest, App } from "obsidian";
import { SafeDataviewQuery, executeSandboxedDvQuery, sandboxedDvQuery } from "./SafeDataviewQuery";
import { createRegexFromInput } from "./createRegexFromInput";
import * as O from "fp-ts/Option";
import { pipe } from "@std";
import * as T from "fp-ts/Task";

type FormData = Record<string, unknown>;

/**
 * Offers suggestions based on a dataview query.
 * It requires the dataview plugin to be installed and enabled.
 * The suggestions can be dynamically updated based on form data.
 */
export class DataviewSuggest extends AbstractInputSuggest<string> {
    private sandboxedQuery: SafeDataviewQuery;
    private formData: O.Option<FormData>;

    constructor(
        public inputEl: HTMLInputElement,
        dvQuery: string,
        public app: App,
    ) {
        super(app, inputEl);
        this.sandboxedQuery = sandboxedDvQuery(dvQuery);
        this.formData = O.none;
    }

    /**
     * Update the form data used in the dataview query.
     * This is called whenever the form data changes.
     */
    updateFormData(newFormData: FormData): void {
        this.formData = O.some(newFormData);
    }

    private getQueryResult(): T.Task<string[]> {
        return pipe(
            this.formData,
            O.fold(
                () => executeSandboxedDvQuery(this.sandboxedQuery, this.app, {}),
                (formData) => executeSandboxedDvQuery(this.sandboxedQuery, this.app, formData)
            )
        );
    }

    getSuggestions(inputStr: string): Promise<string[]> {
        return pipe(
            this.getQueryResult(),
            T.map((results) => 
                inputStr 
                    ? results.filter((r) => createRegexFromInput(inputStr).test(r))
                    : results
            ),
        )();
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
