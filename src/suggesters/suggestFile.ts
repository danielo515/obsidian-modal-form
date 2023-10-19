import { AbstractInputSuggest, App, TAbstractFile, TFile } from "obsidian";
import { get_tfiles_from_folder } from "../utils/files";
import { tryCatch } from "../utils/Error";

// Instead of hardcoding the logic in separate and almost identical classes,
// we move this little logic parts into an interface and we can use the samme
// input type and configure it to render file-like, note-like, or whatever we want.
export interface FileStrategy {
    renderSuggestion(file: TFile): string;
    selectSuggestion(file: TFile): string;
}

export class FileSuggest extends AbstractInputSuggest<TFile> {
    constructor(
        public app: App,
        public inputEl: HTMLInputElement,
        private strategy: FileStrategy,
        private folder: string,
    ) {
        super(app, inputEl);
    }

    getSuggestions(input_str: string): TFile[] {
        const all_files = tryCatch(
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

