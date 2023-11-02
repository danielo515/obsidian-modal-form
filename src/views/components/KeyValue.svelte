<script lang="ts">
    export let key: string;
</script>

<div>
    <span class="key">{key}:</span>
    <slot />
</div>

<style>
    div {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: var(--mf-spacing);
    }
    .key {
        color: var(--text-faint);
    }
</style>
