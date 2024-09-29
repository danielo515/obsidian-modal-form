<script lang="ts">
    import { parseFunctionBody, pipe } from "@std";
    import * as R from "fp-ts/Record";
    import * as TE from "fp-ts/TaskEither";
    import { App, Component, MarkdownRenderer } from "obsidian";
    import { input } from "src/core";
    import { FieldValue, FormEngine } from "src/store/formStore";
    import { notifyError } from "src/utils/Log";
    import { onDestroy } from "svelte";
    import { Subscriber } from "svelte/store";
    type GetSubscription<T> = T extends Subscriber<infer U> ? U : never;

    export let form: FormEngine;
    export let field: input.MarkdownBlock;
    export let app: App;
    let component = new Component();
    $: dv = app.plugins.plugins.dataview?.api;
    $: functionParsed = parseFunctionBody<
        [Record<string, FieldValue>, unknown, HTMLElement],
        string
    >(field.body, "form", "dv", "el");
    onDestroy(() => component.unload());
    // onMount(() => component.load());
    /* I probably... probably should better export the real type the FormEngine has rather than this mess of types... but I wanted to keep that private to the file...
    You can argue that I am exposing it with all tis dark magic, but at least this way it is kept in sync if the type changes?
    */
    function generateContent(
        parent: HTMLElement,
        form: GetSubscription<Parameters<FormEngine["subscribe"]>[0]>,
        execute = false,
    ) {
        if (execute) {
            parent.innerHTML = "";
            pipe(
                functionParsed,
                TE.fromEither,
                TE.chainW((fn) =>
                    pipe(
                        form.fields,
                        R.filterMap((field) => field.value),
                        (fields) => fn(fields, dv, parent),
                    ),
                ),
                TE.match(
                    (error) => {
                        console.error(error);
                        notifyError("Error in markdown block")(String(error));
                    },
                    (newText) => MarkdownRenderer.render(app, newText, parent, "/", component),
                ),
            )();
        }
        return {
            update(newForm: GetSubscription<Parameters<FormEngine["subscribe"]>[0]>) {
                generateContent(parent, newForm, true);
            },
        };
    }
</script>

<div class="markdown-block" use:generateContent={$form}></div>
