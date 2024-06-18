<script lang="ts">
    import { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine } from "src/store/formStore";
    import ObsidianInput from "src/views/components/Form/ObsidianInput.svelte";
    import InputField from "src/views/components/InputField.svelte";
    import ObsidianDropdown from "./views/components/Form/ObsidianDropdown.svelte";
    export let formEngine: ReturnType<typeof makeFormEngine>;
    export let fields: FormDefinition["fields"];
</script>

{#each fields as definition}
    {@const { value, errors } = formEngine.addField(definition)}
    {#if definition.input.type === "select" && definition.input.source === "fixed"}
        <ObsidianDropdown input={definition.input} field={definition} {value} />
    {:else}
        <ObsidianInput
            {errors}
            label={definition.label || definition.name}
            description={definition.description}
        >
            <InputField {value} inputType={definition.input.type} />
        </ObsidianInput>
    {/if}
{/each}
