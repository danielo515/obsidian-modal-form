import { App, TAbstractFile, TFile, TFolder, Vault, normalizePath } from "obsidian";
import { E, Either, pipe } from "@std";
export class FolderDoesNotExistError extends Error {
    static readonly tag = "FolderDoesNotExistError";
}

export class NotAFolderError extends Error {
    static readonly tag = "NotAFolderError";
    constructor(public file: TAbstractFile) {
        super(`File ${file.path} is not a folder`);
    }
}

export class FileDoesNotExistError extends Error {
    static readonly tag = "FileDoesNotExistError";
    static of(file: string) {
        return new FileDoesNotExistError(`File "${file}" doesn't exist`);
    }
}
export class NotAFileError extends Error {
    static readonly tag = "NotAFileError";
    constructor(public file: TAbstractFile) {
        super(`File ${file.path} is not a file`);
    }
}

type FolderError = FolderDoesNotExistError | NotAFolderError;

export function resolve_tfolder(folder_str: string, app: App): Either<FolderError, TFolder> {
    return pipe(
        normalizePath(folder_str),
        (path) => app.vault.getAbstractFileByPath(path),
        E.fromNullable(new FolderDoesNotExistError(`Folder "${folder_str}" doesn't exist`)),
        E.flatMap((file) => {
            if (!(file instanceof TFolder)) {
                return E.left(new NotAFolderError(file));
            }
            return E.right(file);
        })
    );
}

export function resolve_tfile(file_str: string, app: App): Either<FileDoesNotExistError | NotAFileError, TFile> {
    return pipe(
        normalizePath(file_str),
        (path) => app.vault.getAbstractFileByPath(path),
        E.fromNullable(FileDoesNotExistError.of(file_str)),
        E.flatMap((file) => {
            if (!(file instanceof TFile)) {
                return E.left(new NotAFileError(file));
            }
            return E.right(file);
        })
    )
}

export function get_tfiles_from_folder(folder_str: string, app: App): Either<FolderError, Array<TFile>> {
    return pipe(
        resolve_tfolder(folder_str, app),
        E.flatMap((folder) => {
            const files: Array<TFile> = [];
            Vault.recurseChildren(folder, (file: TAbstractFile) => {
                if (file instanceof TFile) {
                    files.push(file);
                }
            });
            return E.right(files);
        }),
        E.map((files) => {
            return files.sort((a, b) => {
                return a.basename.localeCompare(b.basename);
            });
        }
        ))
}
