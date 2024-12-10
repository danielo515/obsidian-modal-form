import { E, pipe, TE } from "@std";
import type { Either } from "fp-ts/Either";
import { FileProxy } from "src/core/files/FileProxy";
import { FileService } from "src/core/files/FileService";
import { type imageInput } from "src/core/input/InputDefinitionSchema";
import { logger } from "src/utils/Logger";
import type { Readable } from "svelte/store";
import { writable } from "svelte/store";

export interface FileInputModel {
    readonly error: Readable<string | null>;
    readonly result: Readable<Either<Error, FileProxy | null>>;
    handleFileChange(file: File): Promise<void>;
}

interface FileInputModelDeps {
    input: imageInput;
    fileService: FileService;
    l?: typeof logger;
}

export function makeFileInputModel({
    fileService,
    input,
    l = logger,
}: FileInputModelDeps): FileInputModel {
    const error = writable<string | null>(null);
    const result = writable<Either<Error, FileProxy | null>>(E.right(null));

    async function handleFileChange(file: File) {
        error.set(null);
        result.set(E.right(null));

        l.debug("handleFileChange file", file);

        const filename = file.name;
        const content = await file.arrayBuffer();
        await pipe(
            fileService.saveFile(filename, input.saveLocation, content),
            TE.map((file) => new FileProxy(file)),
            TE.mapBoth(
                (err) => {
                    error.set(err.message);
                    l.error(err);
                },
                (fileProxy) => {
                    result.set(E.right(fileProxy));
                },
            ),
        )();
    }

    return {
        error,
        result,
        handleFileChange,
    };
}
