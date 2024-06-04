<script lang="ts">
    export let label: string;
    export let id: string;
    export let hideLabel = false;
    export let inline = false;
</script>

<div class="field-group" class:inline>
    <label for={id} class:hidden-label={hideLabel}>{label}</label>
    <slot />
</div>

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
    .hidden-label {
        white-space: nowrap;
        overflow: hidden;
        visibility: hidden;
    }
</style>
