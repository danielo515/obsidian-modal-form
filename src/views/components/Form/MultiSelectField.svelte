<script lang="ts">
    import { App } from "obsidian";
    import { multiselect } from "src/core/InputDefinitionSchema";
    import { FieldValue } from "src/store/formStore";
    import { Readable, Writable } from "svelte/store";
    import MultiSelect from "../MultiSelect.svelte";
    import { MultiSelectModel } from "../MultiSelectModel";
    export let input: multiselect;
    export let app: App;
    export let errors: Readable<string[]>;
    export let value: Writable<FieldValue>;
    $: model = MultiSelectModel(input, app, value as Writable<string[]>);
    $: values = value as Writable<string[]>;
</script>

<MultiSelect {values} {errors} {model} />
