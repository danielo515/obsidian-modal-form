<script lang="ts">
    /** This component is only meant for the most basic input types. If any of those types starts to require more fancy setup it should be moved to it's own separated input*/
    import { type FieldValue } from "src/store/formEngine";
    import { Writable } from "svelte/store";
    export let value: Writable<FieldValue>;
    export let inputType: "number" | "text" | "date" | "time" | "datetime" | "email" | "tel";
</script>

{#if inputType === "number"}
    <!-- Step is required to allow decimals, see #430 & #186 -->
    <input type="number" step="any" bind:value={$value} />
{:else if inputType === "text"}
    <input type="text" bind:value={$value} />
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
