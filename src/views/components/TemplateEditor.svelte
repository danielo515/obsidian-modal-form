<script lang="ts">
    import { E } from "@std";
    import {
        ParsedTemplate,
        parseTemplate,
        templateError,
        templateVariables,
    } from "src/core/template/templateParser";
    import { writable } from "svelte/store";
    import Code from "./Code.svelte";
    import Label from "./Label.svelte";

    export let templateString: string;
    export let formName: string;
    export let fieldNames: string[];
    export let saveTemplate: (
        template: ParsedTemplate,
        commandOptions: { createInsertCommand: boolean; createNoteCommand: boolean },
    ) => void;
    export let initialCommandOptions = { createInsertCommand: false, createNoteCommand: false };

    // Create a store for command options, initialized with values from props
    const commandOptions = writable(initialCommandOptions);

    // Update command options when initialCommandOptions changes
    $: {
        commandOptions.set(initialCommandOptions);
    }
    const firstField = fieldNames[0];
    const exampleText = `Example text {{${firstField}}}`;
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
<div class="command-options">
    <h4>Create Commands</h4>
    <div class="options-container">
        <Label label="Create command to insert template" inline>
            <input type="checkbox" bind:checked={$commandOptions.createInsertCommand} />
        </Label>
        <Label label="Create command to create note from template" inline>
            <input type="checkbox" bind:checked={$commandOptions.createNoteCommand} />
        </Label>
    </div>
</div>

<button
    class="btn btn-primary"
    disabled={!!templateErrorMessage}
    on:click={() => {
        // When the user clicks save, pass both the template and command options to the saveTemplate function
        if (E.isRight(parsedTemplate)) {
            saveTemplate(parsedTemplate.right, $commandOptions);
        }
    }}>Save template</button
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
    .command-options {
        margin: 1rem 0;
    }
    .command-options h4 {
        margin-bottom: 0.5rem;
    }
    .options-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>
