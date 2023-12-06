<script lang="ts">
    import { Writable, Readable } from "svelte/store";
    import { type FieldValue } from "src/store/formStore";
    export let value: Writable<FieldValue>;
    export let errors: Readable<string[]>;
    export let label: string;
    export let description: string;
    console.log(value);
</script>

<!-- Trying to emulate native Obsidian settings -->
<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-name">{label}</div>
        <div class="setting-item-description">{description}</div>
    </div>
    <div class="setting-item-control">
        <input type="text" bind:value={$value} />
    </div>
    {#each $errors as error}
        <p>{error}</p>
    {/each}
</div>
