<script lang="ts">
    import { App } from "obsidian";
    import { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine } from "src/store/formStore";
    import InputField from "src/views/components/Form/InputField.svelte";
    import ObsidianInputWrapper from "src/views/components/Form/ObsidianInputWrapper.svelte";
    import DocumentBlock from "./views/components/Form/DocumentBlock.svelte";
    import InputDataview from "./views/components/Form/InputDataview.svelte";
    import InputFolder from "./views/components/Form/InputFolder.svelte";
    import InputNote from "./views/components/Form/InputNote.svelte";
    import InputTag from "./views/components/Form/InputTag.svelte";
    import InputTextArea from "./views/components/Form/InputTextArea.svelte";
    import MultiSelectField from "./views/components/Form/MultiSelectField.svelte";
    import ObsidianSelect from "./views/components/Form/ObsidianSelect.svelte";
    import ObsidianToggle from "./views/components/Form/ObsidianToggle.svelte";
    import InputSlider from "./views/components/Form/inputSlider.svelte";
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
    {:else if definition.input.type === "note"}
        <InputNote field={definition} input={definition.input} {value} {errors} {app} />
    {:else if definition.input.type === "textarea"}
        <InputTextArea field={definition} {value} {errors} />
    {:else if definition.input.type === "document_block"}
        <!-- I need to put this separated to be able to target the correct slot, it does not work inside #if -->
        <ObsidianInputWrapper
            label={definition.label || definition.name}
            description={definition.description}
        >
            <DocumentBlock field={definition.input} form={formEngine} slot="info" />
        </ObsidianInputWrapper>
    {:else}
        <ObsidianInputWrapper
            {errors}
            label={definition.label || definition.name}
            description={definition.description}
            required={definition.isRequired}
        >
            {#if definition.input.type === "multiselect"}
                <MultiSelectField input={definition.input} {value} {errors} {app} />
            {:else if definition.input.type === "slider"}
                <InputSlider input={definition.input} {value} />
            {:else if definition.input.type === "tag"}
                <InputTag input={definition.input} {value} {errors} {app} />
            {:else}
                <InputField {value} inputType={definition.input.type} />
            {/if}
        </ObsidianInputWrapper>
    {/if}
{/each}
