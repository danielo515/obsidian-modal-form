<script lang="ts">
    export let label: string;
    export let inline = false;
</script>

<label class="field-group" class:inline>
    <span>{label}</span>
    <slot />
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
