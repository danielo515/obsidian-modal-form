<script lang="ts">
    import { input as I } from "@core";
    import { pipe } from "@std";
    import * as R from "fp-ts/Record";
    import { App } from "obsidian";
    import { FieldValue, FormEngine } from "src/store/formEngine";
    import { onDestroy } from "svelte";
    import { Readable, Writable } from "svelte/store";
    import MultiSelect from "../MultiSelect.svelte";
    import { MultiSelectModel } from "../MultiSelectModel";
    export let input: I.multiselect;
    export let app: App;
    export let errors: Readable<string[]>;
    export let value: Writable<FieldValue>;
    export let form: FormEngine;

    let formValues: Record<string, unknown> = {};
    const unsubscribe = form.subscribe((formData) => {
        formValues = pipe(
            formData.fields,
            R.filterMap((field) => field.value),
        );
    });

    onDestroy(unsubscribe);

    $: model = MultiSelectModel(input, app, value as Writable<string[]>, {
        getFormData: () => formValues,
    });
    $: values = value as Writable<string[]>;
</script>

<MultiSelect {values} {errors} {model} />
