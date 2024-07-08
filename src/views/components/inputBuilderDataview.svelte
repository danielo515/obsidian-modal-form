<script lang="ts">
    import { pipe } from "@std";
    import { App } from "obsidian";
    import { executeSandboxedDvQuery, sandboxedDvQuery } from "src/suggesters/SafeDataviewQuery";
    import Code from "./Code.svelte";
    import FormRow from "./FormRow.svelte";

    export let index: number;
    export let value: string = "";
    export let app: App;
    let error = "";
    const logger = (err: { message: string }) => (error = err.message);
    const makePreview = function (query: string) {
        error = "";
        return pipe(query, sandboxedDvQuery, (query) =>
            executeSandboxedDvQuery(query, app, logger),
        );
    };
    $: id = `dataview_${index}`;
    $: preview = makePreview(value);
    console.log({ FormRow, Code });
</script>

<FormRow label="Dataview Query" {id}>
    <span class="modal-form-hint">
        This is a <a href="https://blacksmithgu.github.io/obsidian-dataview/api/intro/">Dataview</a>
        query that will be used to populate the input suggestions. You should provide a query that returns
        a list of strings, for example:
        <pre class="language-js"><code>dv.pages('#tag').map(p => p.file.name)</code></pre>
        It is recommended to take advantage of<a
            href="https://blacksmithgu.github.io/obsidian-dataview/api/data-array"
        >
            Swizzling</a
        >
        to write shorter queries:
        <pre class="language-js"><code>dv.pages('#tag').file.name</code></pre>
    </span>
    <textarea
        {id}
        bind:value
        name="dataview_query"
        class="form-control"
        rows="3"
        placeholder="dv.pages('#tag').map(p => p.file.name)"
    ></textarea>
    <h6>Results preview</h6>
    {#if error}
        <div class="modal-form-error-message">{error}</div>
    {/if}
    {#await preview()}
        --
    {:then previewResult}
        <Code allowWrap>{previewResult}</Code>
    {:catch error}
        <div class="modal-form-error-message">{error}</div>
    {/await}
</FormRow>

<style>
    h6 {
        margin-bottom: 0;
    }
</style>
