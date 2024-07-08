<script lang="ts">
    import { E, pipe } from "@std";
    import {
        type ParsedTemplate,
        parseTemplate,
        templateError,
        templateVariables,
    } from "src/core/template/templateParser";
    import Code from "./Code.svelte";

    export let templateString: string;
    export let formName: string;
    export let fieldNames: string[];
    export let saveTemplate: (template: ParsedTemplate) => void;
    const firstField = fieldNames[0];
    const exampleText = `Example text {{${firstField}}}`;
    const handleSave = () => {
        pipe(parsedTemplate, E.map(saveTemplate));
    };
    $: parsedTemplate = parseTemplate(templateString);
    $: usedVariables = templateVariables(parsedTemplate);
    $: templateErrorMessage = templateError(parsedTemplate);
</script>

<h6>
    Template for {formName}
</h6>

<p>
    Templates are used when you create a note directly from a form. You can put any text you want
    and reference the form fields using the <code>{`{{name}}`}</code>
    syntax.
</p>
<div>
    <div>For example:</div>
    <Code>{exampleText}</Code>
</div>
<button class="btn btn-primary" disabled={!!templateErrorMessage} on:click={handleSave}
    >Save template</button
>
<div class="fields-list">
    Available fields:
    <ul>
        {#each fieldNames as field}
            <li>
                <code>{field}</code>
                {usedVariables.includes(field) ? "✅" : ""}
            </li>
        {/each}
    </ul>
</div>

<textarea
    bind:value={templateString}
    rows={10}
    class="form-control"
    placeholder="Enter template here"
></textarea>
{#if templateErrorMessage}
    <div class="error-wrapper">
        <div class="invalid">The template is invalid:</div>
        <Code>{templateErrorMessage}</Code>
    </div>
{/if}

<style>
    .fields-list {
        padding-top: 1rem;
    }
    textarea {
        font-family: var(--font-family-monospace);
        width: 100%;
    }
</style>
