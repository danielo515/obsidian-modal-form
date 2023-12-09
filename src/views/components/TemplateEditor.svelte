<script lang="ts">
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
    syntax. For example: <code>{exampleText}</code>
</p>
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
