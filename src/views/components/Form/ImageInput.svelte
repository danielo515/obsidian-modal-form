<!-- ImageInput.svelte -->
<script lang="ts">
    import { ensureError } from "@std";
    import { App, normalizePath } from "obsidian";

    export let id: string;
    export let app: App;
    export let saveLocation: string;

    let fileInput: HTMLInputElement;
    let previewImage: HTMLImageElement;
    let selectedFile: File | null = null;
    let error: string | null = null;

    async function saveImage(dataUrl: string) {
        try {
            // Save image using Obsidian API
            const base64Data = dataUrl.split(",")[1];
            if (!base64Data) {
                throw new Error("There was a problem loading the image data");
            }
            const buffer = Buffer.from(base64Data, "base64");

            // Ensure the save location exists
            const folder = normalizePath(saveLocation).split("/").slice(0, -1).join("/");
            const folderExists = await app.vault.adapter.exists(folder);
            if (!folderExists) {
                await app.vault.createFolder(folder);
            }

            await app.vault.createBinary(saveLocation, buffer);

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
