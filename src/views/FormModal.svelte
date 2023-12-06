<script lang="ts">
    import { A, pipe } from "@std";
    import { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine, type OnFormSubmit } from "src/store/formStore";
    import InputField from "./components/InputField.svelte";
    import ObsidianInput from "./components/ObsidianInput.svelte";
    export let onSubmit: OnFormSubmit;
    export let formDefinition: FormDefinition;
    const state = makeFormEngine(onSubmit);
</script>

<h1>{formDefinition.title}</h1>

{#each formDefinition.fields as definition}
    {@const { value, errors } = state.addField(definition)}
    <ObsidianInput
        {errors}
        label={definition.label || definition.name}
        description={definition.description}
    >
        <InputField {value} inputType={definition.input.type} />
    </ObsidianInput>
{/each}

<ObsidianInput>
    <button on:click={state.onSubmit}>Submit</button>
</ObsidianInput>
