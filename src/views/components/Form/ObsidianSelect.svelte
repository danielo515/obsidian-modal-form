<script lang="ts">
    import { E, pipe } from "@std";
    import { App } from "obsidian";
    import { input as I } from "src/core";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formEngine";
    import { log_error } from "src/utils/Log";
    import { get_tfiles_from_folder } from "src/utils/files";
    import { Readable, Writable } from "svelte/store";
    import ObsidianInput from "./ObsidianInputWrapper.svelte";
    export let field: FieldDefinition;
    export let input: I.Select;
    export let value: Writable<FieldValue>;
    export let app: App;
    export let errors: Readable<string[]>;
    function getNoteOptions(folder: string): Record<string, string> {
        const files = get_tfiles_from_folder(folder, app);
        return pipe(
            files,
            E.map((files) =>
                files.reduce((acc: Record<string, string>, option) => {
                    acc[option.basename] = option.basename;
                    return acc;
                }, {}),
            ),
            E.mapLeft((err) => {
                log_error(err);
                return err;
            }),
            E.getOrElse(() => ({})),
        );
    }
</script>

<ObsidianInput {errors} label={field.label || field.name} description={field.description}>
    {#if input.source === "fixed"}
        <select bind:value={$value} class="dropdown">
            {#each input.options as option}
                <option value={option.value}>{option.label}</option>
            {/each}
        </select>
    {:else}
        {@const options = getNoteOptions(input.folder)}
        <select bind:value={$value} class="dropdown">
            {#each Object.entries(options) as [value, label]}
                <option {value}>{label}</option>
            {/each}
        </select>
    {/if}
</ObsidianInput>
