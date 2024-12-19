<script lang="ts">
    import { input as I } from "src/core";
    import { FieldValue } from "src/store/formEngine";
    import { Writable } from "svelte/store";

    export let value: Writable<FieldValue>;
    export let input: I.inputSlider;
</script>

<div class="wrapper">
    <span>
        {$value === undefined ? input.min : $value}
    </span>
    <input type="range" bind:value={$value} class="slider" min={input.min} max={input.max} />
</div>

<style>
    .wrapper {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 1rem;
    }
</style>
