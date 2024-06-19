<script lang="ts">
    import { App } from "obsidian";
    import { input as I } from "src/core";
    import { FieldValue } from "src/store/formStore";
    import { Readable, Writable } from "svelte/store";
    import MultiSelect from "../MultiSelect.svelte";
    import { MultiSelectTags } from "../MultiSelectModel";
    export let input: I.inputTag;
    export let app: App;
    export let errors: Readable<string[]>;
    export let value: Writable<FieldValue>;
    $: model = MultiSelectTags(input, app, value as Writable<string[]>);
    $: values = value as Writable<string[]>;
</script>

<MultiSelect {values} {errors} model={Promise.resolve(model)} />
