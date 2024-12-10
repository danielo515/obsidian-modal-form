import { TE } from "@std";

export type FileProps = {
    /** The full path of the file, including filename and extension */
    path: string;
    /** The complete filename with extension */
    name: string;
    /** The filename without extension */
    basename: string;
    /** The file extension without the leading dot */
    extension: string;
};

export class FileError extends Error {
    protected readonly _tag = "FileError";
    constructor(
        message: string,
        readonly cause: unknown,
    ) {
        super(message);
    }
    static of(message: string) {
        return (cause: unknown) => new FileError(message, cause);
    }
}

export interface FileService {
    /**
     * Saves a file to the specified path, ensuring that the parent folder exists.
     * @param name the name of the file including the extension
     * @param path the path to save the file to
     * @param content the content of the file
     */
    saveFile(name: string, path: string, content: ArrayBuffer): TE.TaskEither<FileError, FileProps>;
}
