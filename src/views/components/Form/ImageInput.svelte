<script lang="ts">
    import { E } from "@std";
    import type { FileProxy } from "src/core/files/FileProxy";
    import type { ImageInputModel } from "./ImageInputModel";

    export let id: string;
    export let model: ImageInputModel;
    export let value: FileProxy | null = null;

    $: ({ error, previewUrl, result } = model);

    $: if (E.isRight($result)) {
        value = $result.right ?? null;
    }

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
            <img src={$previewUrl} alt="Preview" />
        {/if}
    </div>
</div>

<style>
    .image-input-container {
        display: flex;
        flex-direction: column;
        gap: var(--size-4-2);
    }

    .error {
        color: var(--text-error);
    }

    .preview {
        margin-top: var(--size-4-2);
    }

    .preview img {
        max-height: 200px;
        max-width: 200px;
        border-radius: var(--radius-m);
    }
</style>
