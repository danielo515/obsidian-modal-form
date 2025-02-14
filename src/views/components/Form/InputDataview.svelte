<script lang="ts">
    import { App } from "obsidian";
    import { input as I } from "src/core";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue, FormEngine } from "src/store/formEngine";
    import { DataviewSuggest } from "src/suggesters/suggestFromDataview";
    import { Readable, Writable } from "svelte/store";
    import ObsidianInputWrapper from "./ObsidianInputWrapper.svelte";
    import { pipe } from "@std";
    import * as R from "fp-ts/Record";
    import { onDestroy } from "svelte";
    
    export let field: FieldDefinition;
    export let input: I.inputDataviewSource;
    export let value: Writable<FieldValue>;
    export let app: App;
    export let errors: Readable<string[]>;
    export let form: FormEngine;

    let suggester: DataviewSuggest | null = null;

    function dataviewSuggest(el: HTMLInputElement) {
        suggester = new DataviewSuggest(el, input.query, app);
        const unsubscribe = form.subscribe((formData) => {
            const formValues = pipe(
                formData.fields,
                R.filterMap((field) => field.value)
            );
            suggester?.updateFormData(formValues);
        });
        
        onDestroy(() => {
            unsubscribe();
            suggester = null;
        });
    }
</script>

<ObsidianInputWrapper {errors} label={field.label || field.name} description={field.description}>
    <input type="text" bind:value={$value} use:dataviewSuggest />
</ObsidianInputWrapper>
