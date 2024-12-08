<!-- ImageInput.svelte -->
<script lang="ts">
    import { E, ensureError, pipe } from "@std";
    import { absurd } from "fp-ts/lib/function";
    import { App, normalizePath } from "obsidian";
    import { FolderDoesNotExistError, NotAFolderError, resolve_tfolder } from "src/utils/files";
    import { createFilename } from "src/core/input/imageFilenameTemplate";
    import { type imageInput } from "src/core/input/InputDefinitionSchema";

    export let id: string;
    export let app: App;
    export let input: imageInput;

    let fileInput: HTMLInputElement;
    let previewImage: HTMLImageElement;
    let selectedFile: File | null = null;
    let error: string | null = null;

    async function saveImage(dataUrl: string) {
        try {
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
            const fullPath = normalizePath(`${input.saveLocation}/${filename}`);
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
            selectedFile = target.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const dataUrl = e.target?.result as string;
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
