<script lang="ts">
    import { readable } from "svelte/store";
    export let errors = readable([] as string[]);
    export let label = "";
    export let description = "";
    export let required = false;
</script>

<!-- Trying to emulate native Obsidian settings -->
<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-name">
            {label}
            {#if required}
                <span class="required">*</span>
            {/if}
        </div>
        <div class="setting-item-description">{description}</div>
    </div>
    <div class="setting-item-control">
        <slot />
    </div>
    {#each $errors as error}
        <p>{error}</p>
    {/each}
</div>

<style>
    .required {
        color: var(--color-red);
    }
    .setting-item {
        align-items: baseline;
    }
</style>
