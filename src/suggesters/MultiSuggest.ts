import { TextInputSuggest } from "./suggest";

export class MultiSuggest extends TextInputSuggest<string> {
	content: Set<string>;

	constructor(input: HTMLInputElement, content: Set<string>, private onSelect: (value: string) => void) {
		super(app, input);
		this.content = content;
	}

	getSuggestions(inputStr: string): string[] {
		const lowerCaseInputStr = inputStr.toLowerCase();
		return [...this.content].filter((content) =>
			content.contains(lowerCaseInputStr)
		);
	}

	renderSuggestion(content: string, el: HTMLElement): void {
		el.setText(content);
	}

	selectSuggestion(content: string): void {
		this.onSelect(content);
		this.inputEl.value = "";
		// this.inputEl.trigger("blur");
		this.inputEl.blur()
		this.close();
	}
}
