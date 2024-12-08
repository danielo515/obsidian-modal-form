<!-- ImageInput.svelte -->
<script lang="ts">
    import type { App } from "obsidian";
    import type { imageInput } from "src/core/input/InputDefinitionSchema";
    import type { ImageInputModel } from "./ImageInputModel";
    import { makeImageInputModel } from "./ImageInputModel";

    export let id: string;
    export let app: App;
    export let input: imageInput;

    const model: ImageInputModel = makeImageInputModel({ app, input });
    $: ({ error, previewUrl } = model);
    let fileInput: HTMLInputElement;

    function handleFileChange(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files?.[0]) {
            model.handleFileChange(files[0]);
        }
    }
</script>

<div class="image-input-container">
    <input
        type="file"
        {id}
        accept="image/*"
        bind:this={fileInput}
        style="display: none"
        on:change={handleFileChange}
    />

    <button on:click={() => fileInput.click()}>Choose Image</button>

    {#if $error}
        <div class="error">{$error}</div>
    {/if}

    <div class="preview">
        {#if $previewUrl}
            <img
                src={$previewUrl}
                alt="Preview"
                class="hidden"
                on:load={(e) => e.currentTarget.classList.remove("hidden")}
            />
        {/if}
    </div>
</div>

<style>
    .image-input-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .error {
        color: var(--text-error);
        font-size: 0.9em;
    }

    .preview {
        margin-top: 10px;
    }

    .preview img {
        max-width: 200px;
        border-radius: var(--radius-m);
    }

    .preview img.hidden {
        display: none;
    }
</style>
