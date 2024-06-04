<script lang="ts">
    export let checked = false;
    export let tabindex: number = 0;
    function handleChange() {
        checked = !checked;
    }
</script>

<div class="checkbox-container" class:is-enabled={checked} role="checkbox" on:click={handleChange}>
    <input type="checkbox" {tabindex} bind:checked />
</div>
