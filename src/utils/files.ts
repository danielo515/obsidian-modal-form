import * as S from "fp-ts/string";
import { App, CachedMetadata, TAbstractFile, TFile, TFolder, Vault, normalizePath } from "obsidian";
import { E, Either, O, pipe, A } from "@std";
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
        }),
    );
}

export function resolve_tfile(
    file_str: string,
    app: App,
): Either<FileDoesNotExistError | NotAFileError, TFile> {
    return pipe(
        normalizePath(file_str),
        (path) => app.vault.getAbstractFileByPath(path),
        E.fromNullable(FileDoesNotExistError.of(file_str)),
        E.flatMap((file) => {
            if (!(file instanceof TFile)) {
                return E.left(new NotAFileError(file));
            }
            return E.right(file);
        }),
    );
}

export function get_tfiles_from_folder(
    folder_str: string,
    app: App,
): Either<FolderError, Array<TFile>> {
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
        }),
    );
}

function isArrayOfStrings(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === "string");
}

const splitIfString = (value: unknown) =>
    pipe(
        value,
        O.fromPredicate(S.isString),
        O.map((s) => s.split(",")),
    );

export function parseToArrOfStr(str: unknown) {
    return pipe(
        str,
        O.fromNullable,
        O.chain((value) =>
            pipe(
                value,
                splitIfString,
                /* prettier-ignore */
                O.alt(() => pipe(
                    value,
                    O.fromPredicate(isArrayOfStrings))),
            ),
        ),
    );
}
function extract_tags(cache: CachedMetadata): string[] {
    /* prettier-ignore */
    const bodyTags = pipe(
        cache.tags,
        O.fromNullable,
        O.map(A.map((tag) => tag.tag)));

    const frontmatterTags = pipe(
        cache.frontmatter,
        O.fromNullable,
        O.chain((frontmatter) => parseToArrOfStr(frontmatter.tags)),
    );
    /* prettier-ignore */
    return pipe(
        [bodyTags, frontmatterTags],
        A.compact,
        A.flatten);
}

export function enrich_tfile(
    file: TFile,
    app: App,
): TFile & { frontmatter: Record<string, unknown>; tags: string[] } {
    const metadata = app.metadataCache.getCache(file.path);
    return {
        ...file,
        frontmatter: metadata?.frontmatter ?? {},
        tags: pipe(
            metadata,
            O.fromNullable,
            O.map(extract_tags),
            O.getOrElse(() => [] as string[]),
        ),
    };
}

export function file_exists(file_str: string, app: App): boolean {
    return pipe(
        normalizePath(file_str),
        (path) => app.vault.getAbstractFileByPath(path),
        (value) => value !== null,
    );
}
