<script lang="ts">
    import { input as I } from "src/core";
    import { FieldValue } from "src/store/formStore";
    import { Writable } from "svelte/store";

    export let value: Writable<FieldValue>;
    export let input: I.inputSlider;
</script>

<input type="range" bind:value={$value} class="slider" min={input.min} max={input.max} />
