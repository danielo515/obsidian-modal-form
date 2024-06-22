<script lang="ts">
    import { readable } from "svelte/store";
    export let errors = readable([] as string[]);
    export let label = "";
    export let description = "";
    export let required = false;
    export let className = "";
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
        <div class="setting-item-description">{description}</div>
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
