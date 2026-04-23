<script lang="ts">
    import { App } from "obsidian";
    import { readable } from "svelte/store";
    import MarkdownDescription from "./MarkdownDescription.svelte";
    export let errors = readable([] as string[]);
    export let label = "";
    export let description = "";
    export let required = false;
    export let className = "";
    export let app: App | undefined = undefined;
</script>

<!-- Trying to emulate native Obsidian settings -->
<div class="setting-item {className}">
    <div class="setting-item-info">
        <div class="setting-item-name">
            {label}
            {#if required}
                <span class="required">*</span>
            {/if}
        </div>
        {#if app && description}
            <MarkdownDescription {app} text={description} />
        {:else}
            <div class="setting-item-description">{description}</div>
        {/if}
        {#each $errors as error}
            <div class="setting-item-description error">{error}</div>
        {/each}
        <slot name="info" />
    </div>
    <div class="setting-item-control" class:error={$errors.length > 0}>
        <slot />
    </div>
</div>

<style>
    .required {
        color: var(--color-red);
    }
    .setting-item {
        align-items: baseline;
    }
    .error {
        color: var(--text-error);
    }
    /** This will correctly produce a css rule scoped to this file, because the global part is prefixed with a scoped class*/
    .error :global(input) {
        border-color: var(--text-error);
    }
</style>
