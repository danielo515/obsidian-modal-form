<script lang="ts">
    import { App } from "obsidian";
    import { input as I } from "src/core";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formEngine";
    import { FileSuggest } from "src/suggesters/suggestFile";
    import { Readable, Writable } from "svelte/store";
    import ObsidianInputWrapper from "./ObsidianInputWrapper.svelte";
    export let field: FieldDefinition;
    export let input: I.inputNoteFromFolder;
    export let value: Writable<FieldValue>;
    export let app: App;
    export let errors: Readable<string[]>;
    function noteSuggest(el: HTMLInputElement) {
        new FileSuggest(
            app,
            el,
            {
                renderSuggestion(file) {
                    return file.basename;
                },
                selectSuggestion(file) {
                    return file.basename;
                },
            },
            input.folder,
        );
    }
</script>

<ObsidianInputWrapper {errors} label={field.label || field.name} description={field.description}>
    <input type="text" bind:value={$value} use:noteSuggest />
</ObsidianInputWrapper>
