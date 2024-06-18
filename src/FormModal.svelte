<script lang="ts">
    import { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine } from "src/store/formStore";
    import InputField from "src/views/components/Form/InputField.svelte";
    import ObsidianInput from "src/views/components/Form/ObsidianInput.svelte";
    import MultiSelectField from "./views/components/Form/MultiSelectField.svelte";
    import ObsidianSelect from "./views/components/Form/ObsidianSelect.svelte";
    export let formEngine: ReturnType<typeof makeFormEngine>;
    export let fields: FormDefinition["fields"];
</script>

{#each fields as definition}
    {@const { value, errors } = formEngine.addField(definition)}
    {#if definition.input.type === "select" && definition.input.source === "fixed"}
        <ObsidianSelect input={definition.input} field={definition} {value} {errors} />
    {:else}
        <ObsidianInput
            {errors}
            label={definition.label || definition.name}
            description={definition.description}
            required={definition.isRequired}
        >
            {#if definition.input.type === "multiselect"}
                <MultiSelectField input={definition.input} field={definition} {value} {errors} />
            {:else}
                <InputField {value} inputType={definition.input.type} />
            {/if}
        </ObsidianInput>
    {/if}
{/each}
