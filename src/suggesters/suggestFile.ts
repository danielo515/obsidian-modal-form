// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes

import { App, TAbstractFile, TFile } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { get_tfiles_from_folder } from "../utils/files";
import { errorWrapperSync } from "../utils/Error";

// Instead of hardcoding the logic in separate and almost identical classes,
// we move this little logic parts into an interface and we can use the samme
// input type and configure it to render file-like, note-like, or whatever we want.
export interface FileStrategy {
	renderSuggestion(file: TFile): string;
	selectSuggestion(file: TFile): string;
}

export class FileSuggest extends TextInputSuggest<TFile> {
	constructor(
		protected app: App,
		public inputEl: HTMLInputElement,
		private strategy: FileStrategy,
		private folder: string,
	) {
		super(app, inputEl);
	}

	getSuggestions(input_str: string): TFile[] {
		const all_files = errorWrapperSync(
			() => get_tfiles_from_folder(this.folder, this.app),
			"The folder does not exist"
		);
		if (!all_files) {
			return [];
		}

		const lower_input_str = input_str.toLowerCase();

		return all_files.filter((file: TAbstractFile) => {
			return (
				file instanceof TFile &&
				file.extension === "md" &&
				file.path.toLowerCase().contains(lower_input_str)
			);
		});
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(this.strategy.renderSuggestion(file));
	}

	selectSuggestion(file: TFile): void {
		this.inputEl.value = this.strategy.selectSuggestion(file);
		this.inputEl.trigger("input");
		this.close();
	}
}

