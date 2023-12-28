<script lang="ts">
    import { executeSandboxedDvQuery, sandboxedDvQuery } from "src/suggesters/SafeDataviewQuery";
    import FormRow from "./FormRow.svelte";
    import { E, pipe } from "@std";
    import { App } from "obsidian";
    import Code from "./Code.svelte";

    export let index: number;
    export let value: string = "";
    export let app: App;
    $: id = `dataview_${index}`;
    $: preview = pipe(
        value,
        sandboxedDvQuery,
        query => executeSandboxedDvQuery(query, app)
    );
</script>

<FormRow label="Dataview Query" {id}>
    <span class="modal-form-hint">
        This is a <a
            href="https://blacksmithgu.github.io/obsidian-dataview/api/intro/"
            >Dataview</a
        >
        query that will be used to populate the input suggestions. You should provide
        a query that returns a list of strings, for example:
        <pre class="language-js"><code
                >dv.pages('#tag').map(p => p.file.name)</code
            ></pre>
        It is recommended to take advantage of<a
            href="https://blacksmithgu.github.io/obsidian-dataview/api/data-array"
            > Swizzling</a
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
    />
    <Code allowWrap>{preview}</Code>
</FormRow>

<style>
</style>
