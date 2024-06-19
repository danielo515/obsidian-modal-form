<script lang="ts">
    import { App } from "obsidian";
    import { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine } from "src/store/formStore";
    import InputField from "src/views/components/Form/InputField.svelte";
    import ObsidianInputWrapper from "src/views/components/Form/ObsidianInputWrapper.svelte";
    import InputDataview from "./views/components/Form/InputDataview.svelte";
    import InputFolder from "./views/components/Form/InputFolder.svelte";
    import InputTag from "./views/components/Form/InputTag.svelte";
    import MultiSelectField from "./views/components/Form/MultiSelectField.svelte";
    import ObsidianSelect from "./views/components/Form/ObsidianSelect.svelte";
    import ObsidianToggle from "./views/components/Form/ObsidianToggle.svelte";
    export let app: App;
    export let formEngine: ReturnType<typeof makeFormEngine>;
    export let fields: FormDefinition["fields"];
</script>

{#each fields as definition}
    {@const { value, errors } = formEngine.addField(definition)}
    {#if definition.input.type === "select"}
        <ObsidianSelect input={definition.input} field={definition} {value} {errors} />
    {:else if definition.input.type === "toggle"}
        <ObsidianToggle field={definition} {value} />
    {:else if definition.input.type === "folder"}
        <InputFolder field={definition} {value} {app} />
    {:else if definition.input.type === "dataview"}
        <InputDataview field={definition} input={definition.input} {value} {errors} {app} />
    {:else}
        <ObsidianInputWrapper
            {errors}
            label={definition.label || definition.name}
            description={definition.description}
            required={definition.isRequired}
        >
            {#if definition.input.type === "multiselect"}
                <MultiSelectField input={definition.input} {value} {errors} {app} />
            {:else if definition.input.type === "tag"}
                <InputTag input={definition.input} {value} {errors} {app} />
            {:else}
                <InputField {value} inputType={definition.input.type} />
            {/if}
        </ObsidianInputWrapper>
    {/if}
{/each}
