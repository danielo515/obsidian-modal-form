<script lang="ts">
    import { E } from "@std";
    import { App } from "obsidian";
    import { FileProxy } from "src/core/files/FileProxy";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FormEngine } from "src/store/formStore";
    import { logger as l } from "src/utils/Logger";
    import InputField from "src/views/components/Form/InputField.svelte";
    import ObsidianInputWrapper from "src/views/components/Form/ObsidianInputWrapper.svelte";
    import { derived } from "svelte/store";
    import DocumentBlock from "./DocumentBlock.svelte";
    import ImageInput from "./ImageInput.svelte";
    import { makeImageInputModel } from "./ImageInputModel";
    import InputDataview from "./InputDataview.svelte";
    import InputFolder from "./InputFolder.svelte";
    import InputNote from "./InputNote.svelte";
    import InputSlider from "./inputSlider.svelte";
    import InputTag from "./InputTag.svelte";
    import InputTextArea from "./InputTextArea.svelte";
    import MarkdownBlock from "./MarkdownBlock.svelte";
    import MultiSelectField from "./MultiSelectField.svelte";
    import ObsidianSelect from "./ObsidianSelect.svelte";
    import ObsidianToggle from "./ObsidianToggle.svelte";

    export let model: ReturnType<FormEngine["addField"]>;
    export let definition: FieldDefinition;
    export let formEngine: FormEngine;
    export let app: App;
    export let logger = l;

    $: value = model.value;
    $: errors = model.errors;
    $: isVisible = model.isVisible;
    $: visibleError = derived(model.isVisible, ($isVisible) =>
        E.isLeft($isVisible) ? [$isVisible.left] : ([] as string[]),
    );
    $: logger.debug($isVisible);
</script>

{#if E.isLeft($isVisible)}
    <ObsidianInputWrapper
        label={definition.label || definition.name}
        description={definition.description}
        errors={visibleError}
    >
        <input type="text" class="input" disabled placeholder="Condition error" />
    </ObsidianInputWrapper>
{:else if $isVisible.right}
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
    {:else if definition.input.type === "markdown_block"}
        <MarkdownBlock field={definition.input} form={formEngine} {app} />
    {:else if definition.input.type === "document_block"}
        <!-- I need to put this separated to be able to target the correct slot, it does not work inside #if -->
        <ObsidianInputWrapper
            label={definition.label || definition.name}
            description={definition.description}
        >
            <DocumentBlock field={definition.input} form={formEngine} slot="info" {app} />
        </ObsidianInputWrapper>
    {:else if definition.input.type === "image"}
        <ObsidianInputWrapper
            {errors}
            label={definition.label || definition.name}
            description={definition.description}
            required={definition.isRequired}
        >
            {#if $value == null || $value instanceof FileProxy}
                {@const imageModel = makeImageInputModel({ app, input: definition.input })}
                <ImageInput id={definition.name} model={imageModel} bind:value={$value} />
            {/if}
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
{/if}
