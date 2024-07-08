<script lang="ts">
    import type { Snippet } from "svelte";
    let {label, inline, children}: {label:string, inline: boolean, children: Snippet} = $props();
</script>

<label class="field-group" class:inline>
    <span>{label}</span>
    {@render children()}
</label>

<style>
    .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .inline {
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }
</style>
