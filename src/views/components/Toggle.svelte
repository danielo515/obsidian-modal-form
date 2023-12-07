<script lang="ts">
    export let checked = false;
    export let tabindex: number = 0;
</script>

<div
    class="checkbox-container"
    class:is-enabled={checked}
    on:click={() => (checked = !checked)}
>
    <input type="checkbox" {tabindex} bind:checked />
</div>
