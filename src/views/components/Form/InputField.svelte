<script lang="ts">
    import { FormDefinition } from "src/core/formDefinition";
    import { type FieldValue } from "src/store/formStore";
    import { Writable } from "svelte/store";
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
{:else if inputType === "slider"}
    <input type="range" bind:value={$value} class="slider" />
{:else if inputType === "email"}
    <input type="email" bind:value={$value} />
{:else if inputType === "tel"}
    <input type="tel" bind:value={$value} />
{:else if inputType === "date"}
    <input type="date" bind:value={$value} />
{:else if inputType === "time"}
    <input type="time" bind:value={$value} />
{:else if inputType === "datetime"}
    <input type="datetime-local" bind:value={$value} />
{/if}

<style>
    textarea {
        width: 100%;
        flex: 1;
        padding: 0.5rem;
    }
</style>
