<script lang="ts">
    /** This component is only meant for the most basic input types. If any of those types starts to require more fancy setup it should be moved to it's own separated input*/
    import { type FieldValue } from "src/store/formEngine";
    import { Writable } from "svelte/store";
    export let value: Writable<FieldValue>;
    export let inputType: "number" | "text" | "date" | "time" | "datetime" | "email" | "tel";
    export let name = "";
</script>

{#if inputType === "number"}
    <!-- Step is required to allow decimals, see #430 & #186 -->
    <input type="number" step="any" {name} bind:value={$value} />
{:else if inputType === "text"}
    <input type="text" {name} bind:value={$value} />
{:else if inputType === "email"}
    <input type="email" {name} bind:value={$value} />
{:else if inputType === "tel"}
    <input type="tel" {name} bind:value={$value} />
{:else if inputType === "date"}
    <input type="date" {name} bind:value={$value} />
{:else if inputType === "time"}
    <input type="time" {name} bind:value={$value} />
{:else if inputType === "datetime"}
    <input type="datetime-local" {name} bind:value={$value} />
{/if}
