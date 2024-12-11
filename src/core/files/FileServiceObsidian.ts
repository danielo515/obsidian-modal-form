import { pipe, TE } from "@std";
import { App, normalizePath } from "obsidian";
import { resolve_tfolder } from "src/utils/files";
import { Logger } from "src/utils/Logger";
import { FileError, FileService } from "./FileService";

export class ObsidianFileService implements FileService {
    constructor(
        private app: App,
        private logger: Logger,
    ) {}
    createFile = (fullPath: string, content: ArrayBuffer) =>
        TE.tryCatch(
            () => this.app.vault.createBinary(fullPath, content),
            (err) =>
                err instanceof Error
                    ? new FileError(err.message, err)
                    : new FileError("Error creating file", err),
        );
    createFolder = (fullPath: string) =>
        TE.tryCatch(
            () => this.app.vault.createFolder(fullPath),
            FileError.of("Error creating folder"),
        );
    saveFile = (fileName: string, path: string, content: ArrayBuffer) => {
        return pipe(
            resolve_tfolder(path, this.app),
            TE.fromEither,
            TE.catchTag("FolderDoesNotExistError", (err) => {
                this.logger.debug("Folder does not exist, creating it", err);
                return this.createFolder(path);
            }),
            TE.catchTag("NotAFolderError", (err) =>
                TE.left(new FileError("Destination is not a folder", err)),
            ),
            TE.map((tFolder) => normalizePath(`${tFolder.path}/${fileName}`)),
            TE.chain((path) => this.createFile(path, content)),
        );
    };
}
