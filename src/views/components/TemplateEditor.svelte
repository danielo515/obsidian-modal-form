<script lang="ts">
    import Code from "./Code.svelte";

    let templateString = "";
    export let formName: string;
    export let fieldNames: string[];
    const firstField = fieldNames[0];
    const exampleText = `Example text {{${firstField}}}`;
</script>

<h6>
    Template for {formName}
</h6>

<p>
    Templates are used when you create a note directly from a form. You can put
    any text you want and reference the form fields using the <code
        >{`{{name}}`}</code
    >
    syntax.
</p>
<div>
    <div>For example:</div>
    <Code>{exampleText}</Code>
</div>
<div class="fields-list">
    Available fields:
    <ul>
        {#each fieldNames as field}
            <li><code>{field}</code></li>
        {/each}
    </ul>
</div>

<textarea
    bind:value={templateString}
    rows={10}
    class="form-control"
    placeholder="Enter template here"
></textarea>

<style>
    .fields-list {
        padding-top: 1rem;
    }
    textarea {
        font-family: var(--font-family-monospace);
        width: 100%;
    }
</style>
