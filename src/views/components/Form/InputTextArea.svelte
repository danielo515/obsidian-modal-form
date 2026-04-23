<script lang="ts">
    import { App, Platform } from "obsidian";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formEngine";
    import { Readable, Writable } from "svelte/store";
    import ObsidianInputWrapper from "./ObsidianInputWrapper.svelte";
    export let field: FieldDefinition;
    export let value: Writable<FieldValue>;
    export let errors: Readable<string[]>;
    export let app: App | undefined = undefined;
    function customizeTextArea(el: HTMLTextAreaElement) {
        if (Platform.isIosApp) el.style.width = "100%";
        else if (Platform.isDesktopApp) {
            el.rows = 10;
        }
    }
</script>

<ObsidianInputWrapper
    {errors}
    label={field.label || field.name}
    description={field.description}
    className="modal-form-textarea"
    {app}
>
    <textarea bind:value={$value} use:customizeTextArea />
</ObsidianInputWrapper>
