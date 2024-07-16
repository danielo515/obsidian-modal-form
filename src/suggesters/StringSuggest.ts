import type { App } from "obsidian";
import { AbstractInputSuggest } from "obsidian";

export class StringSuggest extends AbstractInputSuggest<string> {
    content: Set<string>;

    constructor(
        private inputEl: HTMLInputElement,
        content: Set<string>,
        private onSelectCb: (value: string) => void,
        app: App,
        private allowUnknownValues = false,
    ) {
        super(app, inputEl);
        this.content = content;
    }

    getSuggestions(inputStr: string): string[] {
        const lowerCaseInputStr = inputStr.toLocaleLowerCase();
        const candidates =
            this.allowUnknownValues && inputStr !== ""
                ? [...this.content, inputStr]
                : Array.from(this.content);
        return candidates.filter((content) =>
            content.toLocaleLowerCase().contains(lowerCaseInputStr),
        );
    }

    renderSuggestion(content: string, el: HTMLElement): void {
        el.setText(content);
    }

    selectSuggestion(content: string, evt: MouseEvent | KeyboardEvent): void {
        this.onSelectCb(content);
        this.inputEl.value = "";
        this.close();
        this.inputEl.focus();
    }
}
