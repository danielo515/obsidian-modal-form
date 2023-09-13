import { App, TAbstractFile, TFile, TFolder, Vault, normalizePath } from "obsidian";
import { ModalFormError } from "./Error";

export function resolve_tfolder(folder_str: string, app: App): TFolder {
	folder_str = normalizePath(folder_str);

	const folder = app.vault.getAbstractFileByPath(folder_str);
	if (!folder) {
		throw new ModalFormError(`Folder "${folder_str}" doesn't exist`);
	}
	if (!(folder instanceof TFolder)) {
		throw new ModalFormError(`${folder_str} is a file, not a folder`);
	}

	return folder;
}

export function resolve_tfile(file_str: string, app: App): TFile {
	file_str = normalizePath(file_str);

	const file = app.vault.getAbstractFileByPath(file_str);
	if (!file) {
		throw new ModalFormError(`File "${file_str}" doesn't exist`);
	}
	if (!(file instanceof TFile)) {
		throw new ModalFormError(`${file_str} is a folder, not a file`);
	}

	return file;
}

export function get_tfiles_from_folder(folder_str: string, app: App): Array<TFile> {
	const folder = resolve_tfolder(folder_str, app);

	const files: Array<TFile> = [];
	Vault.recurseChildren(folder, (file: TAbstractFile) => {
		if (file instanceof TFile) {
			files.push(file);
		}
	});

	files.sort((a, b) => {
		return a.basename.localeCompare(b.basename);
	});

	return files;
}
