import { E, pipe, TE } from "@std";
import type { Either } from "fp-ts/Either";
import { absurd, constVoid } from "fp-ts/function";
import { App, normalizePath } from "obsidian";
import { FileProxy } from "src/core/files/FileProxy";
import { createFilename } from "src/core/input/imageFilenameTemplate";
import { type imageInput } from "src/core/input/InputDefinitionSchema";
import { FolderDoesNotExistError, NotAFolderError, resolve_tfolder } from "src/utils/files";
import { logger } from "src/utils/Logger";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface ImageInputModel {
    readonly error: Readable<string | null>;
    readonly previewUrl: Readable<string | null>;
    readonly result: Readable<Either<Error, FileProxy | null>>;
    handleFileChange(file: File): Promise<void>;
}

interface ImageInputModelDeps {
    app: App;
    input: imageInput;
    l?: typeof logger;
}

function getImageExtension(dataUrl: string): Either<Error, string> {
    return pipe(
        dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/),
        E.fromNullable(new Error("Invalid image format")),
        E.chain(
            E.liftNullable(
                (x) => x[1],
                (_) => new Error("Invalid image format"),
            ),
        ),
        E.chain((mimeType) =>
            pipe(
                mimeType.split("/")[1],
                E.fromNullable(new Error("Invalid image format")),
                E.map((extension) => {
                    switch (extension.toLowerCase()) {
                        case 'jpeg': return 'jpg';
                        case 'svg+xml': return 'svg';
                        case 'tiff': return 'tif';
                        default: return extension;
                    }
                }),
            ),
        ),
    );
}

export function makeImageInputModel({ app, input, l = logger }: ImageInputModelDeps): ImageInputModel {
    const error = writable<string | null>(null);
    const previewUrl = writable<string | null>(null);
    const result = writable<Either<Error, FileProxy | null>>(E.right(null));

    async function saveImage(dataUrl: string): Promise<Either<Error, FileProxy>> {
        return pipe(
            // Get image extension
            pipe(
                getImageExtension(dataUrl),
                TE.fromEither
            ),
            
            // Extract base64 data
            TE.chain((extension) => 
                pipe(
                    dataUrl.split(",")[1],
                    E.fromNullable(new Error("There was a problem loading the image data")),
                    E.map((base64Data) => {
                        const binaryStr = atob(base64Data);
                        const bytes = new Uint8Array(binaryStr.length);
                        for (let i = 0; i < binaryStr.length; i++) {
                            bytes[i] = binaryStr.charCodeAt(i);
                        }
                        return { extension, bytes };
                    }),
                    TE.fromEither
                )
            ),
            
            // Ensure save location exists
            TE.chain(({extension, bytes}) => {
                return pipe(
                    input.saveLocation,
                    (path) => resolve_tfolder(path, app),
                    E.fold(
                        (err): TE.TaskEither<Error, void> => {
                            if (err instanceof FolderDoesNotExistError) {
                                return TE.tryCatch(
                                    () => app.vault.createFolder(input.saveLocation).then(constVoid),
                                    (e) => e instanceof Error ? e : new Error("Failed to create folder")
                                );
                            }
                            if (err instanceof NotAFolderError) {
                                return TE.left(new Error("Save location is not a folder"));
                            }
                            return absurd(err);
                        },
                        (): TE.TaskEither<Error, void> => TE.right(undefined)
                    ),
                    TE.map(() => ({extension, bytes}))
                );
            }),
            
            // Save the file
            TE.chain(({extension, bytes}) => {
                const filename = createFilename(input.filenameTemplate);
                const fullPath = normalizePath(`${input.saveLocation}/${filename}.${extension}`);
                return pipe(
                    TE.tryCatch(
                        () => app.vault.createBinary(fullPath, bytes),
                        (e) => e instanceof Error ? e : new Error("Failed to save file")
                    ),
                    TE.map((file) => new FileProxy(file))
                );
            }),
            
            // Finally evaluate the TaskEither
            (te) => te()
        );
    }

    async function handleFileChange(file: File) {
        error.set(null);
        previewUrl.set(null);
        result.set(E.right(null));

        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result;
            if (typeof dataUrl !== "string") {
                error.set("Failed to read image file");
                return;
            }

            previewUrl.set(dataUrl);
            const saveResult = await saveImage(dataUrl);
            if (E.isLeft(saveResult)) {
                error.set(saveResult.left.message);
                result.set(saveResult);
            } else {
                result.set(saveResult);
            }
        };
        reader.readAsDataURL(file);
    }

    return {
        error,
        previewUrl,
        result,
        handleFileChange
    };
}
