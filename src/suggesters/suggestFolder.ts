// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes
import { AbstractInputSuggest, App, TAbstractFile, TFolder } from "obsidian";

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
    constructor(
        public inputEl: HTMLInputElement,
        public app: App,
        private parentFolder?: string,
    ) {
        super(app, inputEl);
    }

    getSuggestions(inputStr: string): TFolder[] {
        const abstractFiles = this.app.vault.getAllLoadedFiles();
        const lowerCaseInputStr = inputStr.toLowerCase();

        const folders: TFolder[] = abstractFiles.reduce((acc, folder: TAbstractFile) => {
            if (!(folder instanceof TFolder)) return acc;

            const folderPath = folder.path.toLowerCase();
            const matchesInput = folderPath.contains(lowerCaseInputStr);
            const matchesParent =
                !this.parentFolder || folderPath.startsWith(this.parentFolder.toLowerCase());

            if (matchesInput && matchesParent) {
                acc.push(folder);
            }
            return acc;
        }, [] as TFolder[]);

        return folders;
    }

    renderSuggestion(file: TFolder, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFolder): void {
        this.inputEl.value = file.path;
        this.inputEl.trigger("input");
        this.close();
    }
}
