<script lang="ts">
    import { inputSelectFixed } from "src/core/InputDefinitionSchema";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formStore";
    import { Readable, Writable } from "svelte/store";
    import ObsidianInput from "./ObsidianInput.svelte";
    export let field: FieldDefinition;
    export let input: inputSelectFixed;
    export let value: Writable<FieldValue>;
    export let errors: Readable<string[]>;
</script>

<ObsidianInput {errors} label={field.label || field.name} description={field.description}>
    <select bind:value={$value} class="dropdown">
        {#each input.options as option}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</ObsidianInput>
