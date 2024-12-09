import type { TFile, TFolder } from "obsidian";

/**
 * Represents the serializable data of a file.
 * This interface contains only the essential, serializable properties of a file
 * that can be safely converted to JSON.
 */
export interface SerializableFileData {
    /** The full path of the file, including filename and extension */
    path: string;
    /** The complete filename with extension */
    name: string;
    /** The filename without extension */
    basename: string;
    /** The file extension without the leading dot */
    extension: string;
}

/**
 * A proxy wrapper for TFile that provides safe serialization.
 * This class encapsulates a TFile instance and provides access to its
 * essential properties while ensuring that the data can be safely serialized to JSON.
 * 
 * @example
 * ```typescript
 * declare const file: TFile;
 * const proxy = new FileProxy(file);
 * 
 * // Access properties
 * console.log(proxy.path); // "folder/file.md"
 * 
 * // Serialize
 * const json = JSON.stringify(proxy); // Safe to serialize
 * ```
 */
export class FileProxy {
    /**
     * Creates a new FileProxy instance.
     * @param file - The TFile instance to wrap
     */
    constructor(private file: TFile) {}

    /**
     * Gets the full path of the file, including filename and extension.
     */
    get path(): string {
        return this.file.path;
    }

    /**
     * Gets the complete filename with extension.
     */
    get name(): string {
        return this.file.name;
    }

    /**
     * Gets the filename without extension.
     */
    get basename(): string {
        return this.file.basename;
    }

    /**
     * Gets the file extension without the leading dot.
     */
    get extension(): string {
        return this.file.extension;
    }

    get TFile(): TFile {
        return this.file;
    }

    get parent(): TFolder | null {
        return this.file.parent;
    }

    /**
     * Converts the FileProxy instance to a plain object suitable for serialization.
     * This method is automatically called by JSON.stringify().
     * 
     * @returns A plain object containing the serializable file data
     */
    toJSON(): SerializableFileData {
        return {
            path: this.path,
            name: this.name,
            basename: this.basename,
            extension: this.extension,
        };
    }
}
