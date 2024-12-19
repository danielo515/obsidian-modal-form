<script lang="ts">
    import { App } from "obsidian";
    import { input as I } from "src/core";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formEngine";
    import { DataviewSuggest } from "src/suggesters/suggestFromDataview";
    import { Readable, Writable } from "svelte/store";
    import ObsidianInputWrapper from "./ObsidianInputWrapper.svelte";
    export let field: FieldDefinition;
    export let input: I.inputDataviewSource;
    export let value: Writable<FieldValue>;
    export let app: App;
    export let errors: Readable<string[]>;
    function dataviewSuggest(el: HTMLInputElement) {
        new DataviewSuggest(el, input.query, app);
    }
</script>

<ObsidianInputWrapper {errors} label={field.label || field.name} description={field.description}>
    <input type="text" bind:value={$value} use:dataviewSuggest />
</ObsidianInputWrapper>
