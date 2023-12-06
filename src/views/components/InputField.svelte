<script lang="ts">
    import { Writable } from "svelte/store";
    import { type FieldValue } from "src/store/formStore";
    import { FormDefinition } from "src/core/formDefinition";
    import { absurd } from "fp-ts/lib/function";
    import MultiSelect from "./MultiSelect.svelte";
    export let value: Writable<FieldValue>;
    export let inputType: FormDefinition["fields"][0]["input"]["type"];
    console.log(value);
</script>

{#if inputType === "toggle"}
    <div class="checkbox-container">
        <input type="checkbox" bind:checked={$value} />
    </div>
{:else if inputType === "number"}
    <input type="number" bind:value={$value} />
{:else if inputType === "text"}
    <input type="text" bind:value={$value} />
{:else if inputType === "textarea"}
    <textarea bind:value={$value} />
{:else if inputType === "select"}
    TODO
{:else if inputType === "multiselect"}
    <MultiSelect selectedVales={$value} options={[]} />
{:else if inputType === "slider"}
    <input type="range" bind:value={$value} class="slider" />
{:else}
    <!-- {@const error = absurd(inputType)} -->
    <input type="text" bind:value={$value} />
{/if}

<style>
    textarea {
        width: 100%;
        flex: 1;
        padding: 0.5rem;
    }
</style>
