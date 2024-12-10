<script lang="ts">
    import { E } from "@std";
    import { FileProxy } from "src/core/files/FileProxy";
    import { FileInputModel } from "./FileInputModel";

    export let model: FileInputModel;
    export let value: FileProxy | null = null;
    export let id: string;
    let fileInput: HTMLInputElement;
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

<div class="file-input-container">
    <input
        type="file"
        {id}
        bind:this={fileInput}
        style="display: none"
        on:change={handleFileChange}
    />

    <button on:click={() => fileInput.click()}>Choose File</button>

    {#if $error}
        <div class="error">{$error}</div>
    {/if}
</div>

<style>
    .file-input-container {
        display: flex;
        flex-direction: column;
        gap: var(--size-4-2);
    }

    .error {
        color: var(--text-error);
    }
</style>
