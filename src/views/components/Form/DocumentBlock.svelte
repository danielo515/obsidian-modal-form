<script lang="ts">
    import { parseFunctionBody, pipe } from "@std";
    import * as R from "fp-ts/Record";
    import * as TE from "fp-ts/TaskEither";
    import { sanitizeHTMLToDom } from "obsidian";
    import { input } from "src/core";
    import type { FieldValue, FormEngine } from "src/store/formStore";
    import { notifyError } from "src/utils/Log";
    import type { Subscriber } from "svelte/store";
    type GetSubscription<T> = T extends Subscriber<infer U> ? U : never;

    export let form: FormEngine;
    export let field: input.DocumentBlock;
    $: functionParsed = parseFunctionBody<[Record<string, FieldValue>], string>(field.body, "form");
    /* I probably... probably should better export the real type the FormEngine has rather than this mess of types... but I wanted to keep that private to the file...
    You can argue that I am exposing it with all tis dark magic, but at least this way it is kept in sync if the type changes?
    */
    function generateContent(
        parent: HTMLElement,
        form: GetSubscription<Parameters<FormEngine["subscribe"]>[0]>,
    ) {
        pipe(
            functionParsed,
            TE.fromEither,
            TE.chainW((fn) =>
                pipe(
                    form.fields,
                    R.filterMap((field) => field.value),
                    fn,
                ),
            ),
            TE.match(
                (error) => {
                    console.error(error);
                    notifyError("Error in document block")(String(error));
                },
                (newText) => parent.setText(sanitizeHTMLToDom(newText)),
            ),
        )();
        return {
            update(newForm: GetSubscription<Parameters<FormEngine["subscribe"]>[0]>) {
                generateContent(parent, newForm);
            },
        };
    }
</script>

<div class="document-block" use:generateContent={$form}></div>
