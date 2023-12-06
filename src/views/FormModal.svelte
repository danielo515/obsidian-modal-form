<script lang="ts">
    import { A, pipe } from "@std";
    import { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine, type OnFormSubmit } from "src/store/formStore";
    import InputField from "./components/InputField.svelte";
    export let onSubmit: OnFormSubmit;
    export let formDefinition: FormDefinition;
    const state = makeFormEngine(onSubmit);
</script>

{#each formDefinition.fields as definition}
    {@const { value, errors } = state.addField(definition)}

    <InputField
        {value}
        {errors}
        label={definition.label || definition.name}
        description={definition.description}
    />
{/each}

<button on:click={state.onSubmit}>Submit</button>
