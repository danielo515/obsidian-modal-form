<script lang="ts">
    import { E } from "@std";
    import { FileProxy } from "src/core/files/FileProxy";
    import { FileInputModel } from "./FileInputModel";

    export let id: string;
    export let model: FileInputModel;
    export let value: FileProxy | null = null;
    let input: HTMLInputElement;
    function handleFileChange(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files?.[0]) {
            model.handleFileChange(files[0]);
        }
    }

    $: ({ error, result } = model);

    $: if (E.isRight($result)) {
        value = $result.right ?? null;
    }
</script>

<div class="file-input">
    {#if value}
        <div class="file-preview">
            <span>{value.path}</span>
        </div>
    {:else}
        <input
            bind:this={input}
            {id}
            type="file"
            accept={model.accepted}
            on:change={handleFileChange}
        />
    {/if}
    {#if $error}
        <div class="error">{$error}</div>
    {/if}
</div>

<style>
    .file-input {
        width: 100%;
    }

    .file-preview {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: var(--background-modifier-form-field);
        border-radius: var(--radius-s);
    }

    .clear-button {
        padding: 0 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        color: var(--text-muted);
    }

    .clear-button:hover {
        color: var(--text-normal);
    }

    input[type="file"] {
        width: 100%;
        padding: 0.5rem;
        background-color: var(--background-modifier-form-field);
        border-radius: var(--radius-s);
    }
    .error {
        color: var(--text-error);
    }
</style>
