<script lang="ts">
    import { input as I } from "@core";
    import { App } from "obsidian";
    import { FieldValue } from "src/store/formEngine";
    import { Readable, Writable } from "svelte/store";
    import MultiSelect from "../MultiSelect.svelte";
    import { MultiSelectModel } from "../MultiSelectModel";
    export let input: I.multiselect;
    export let app: App;
    export let errors: Readable<string[]>;
    export let value: Writable<FieldValue>;
    $: model = MultiSelectModel(input, app, value as Writable<string[]>);
    $: values = value as Writable<string[]>;
</script>

<MultiSelect {values} {errors} {model} />
