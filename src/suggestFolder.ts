// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes
import { TAbstractFile, TFolder } from "obsidian";
import { TextInputSuggest } from "./suggest";

export class FolderSuggest extends TextInputSuggest<TFolder> {
  getSuggestions(inputStr: string): TFolder[] {
    const abstractFiles = app.vault.getAllLoadedFiles();
    const lowerCaseInputStr = inputStr.toLowerCase();

    const folders: TFolder[] = abstractFiles.reduce((acc, folder: TAbstractFile) => {
      if (
        folder instanceof TFolder &&
        folder.path.toLowerCase().contains(lowerCaseInputStr)
      ) {
        acc.push(folder)
      }
      return acc
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
