<!-- ImageInput.svelte -->
<script lang="ts">
    import { E, ensureError, pipe } from "@std";
    import type { Either } from "fp-ts/lib/Either";
    import { absurd } from "fp-ts/lib/function";
    import { App, normalizePath } from "obsidian";
    import { createFilename } from "src/core/input/imageFilenameTemplate";
    import { type imageInput } from "src/core/input/InputDefinitionSchema";
    import { FolderDoesNotExistError, NotAFolderError, resolve_tfolder } from "src/utils/files";
    import { logger } from "src/utils/Logger";

    export let id: string;
    export let app: App;
    export let input: imageInput;
    export let l = logger;

    let fileInput: HTMLInputElement;
    let previewImage: HTMLImageElement;
    let error: string | null = null;

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
                    E.map((extension) => extension.replace("jpeg", "jpg")),
                ),
            ),
        );
    }

    async function saveImage(dataUrl: string) {
        try {
            const extension = await pipe(
                getImageExtension(dataUrl),
                E.getOrElseW((err) => {
                    throw err;
                }),
            );

            const base64Data = dataUrl.split(",")[1];
            if (!base64Data) {
                throw new Error("There was a problem loading the image data");
            }
            const buffer = Buffer.from(base64Data, "base64");

            await pipe(
                input.saveLocation,
                (path) => resolve_tfolder(path, app),
                E.fold(
                    async (err) => {
                        if (err instanceof FolderDoesNotExistError) {
                            return await app.vault.createFolder(input.saveLocation);
                        }
                        if (err instanceof NotAFolderError) {
                            throw new Error("Save location is not a folder");
                        }
                        return absurd(err);
                    },
                    () => Promise.resolve(),
                ),
            );

            const filename = createFilename(input.filenameTemplate);
            const fullPath = normalizePath(`${input.saveLocation}/${filename}.${extension}`);
            await app.vault.createBinary(fullPath, buffer);

            error = null;
        } catch (e) {
            const err = ensureError(e);
            error = `Failed to save image: ${err.message}`;
            console.error("Error saving image:", error);
        }
    }

    function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const selectedFile = target.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const dataUrl = e.target?.result;
                l.debug("dataUrl", dataUrl);
                if (typeof dataUrl !== "string") {
                    console.error("Invalid data URL", dataUrl);
                    return;
                }
                if (previewImage) {
                    previewImage.src = dataUrl;
                }
                await saveImage(dataUrl);
            };

            reader.readAsDataURL(selectedFile);
        }
    }
</script>

<div class="image-input-container">
    <input
        type="file"
        accept="image/*"
        bind:this={fileInput}
        on:change={handleFileChange}
        {id}
        style="display: none"
    />

    <button on:click={() => fileInput.click()}> Choose Image </button>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <div class="preview">
        <img
            bind:this={previewImage}
            alt="Preview"
            style="max-width: 200px; display: none"
            on:load={() => (previewImage.style.display = "block")}
        />
    </div>
</div>

<style>
    .image-input-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .error {
        color: red;
        font-size: 0.9em;
    }

    .preview {
        margin-top: 10px;
    }
</style>
