<script lang="ts">
    import { Platform } from "obsidian";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formEngine";
    import { Readable, Writable } from "svelte/store";
    import ObsidianInputWrapper from "./ObsidianInputWrapper.svelte";
    export let field: FieldDefinition;
    export let value: Writable<FieldValue>;
    export let errors: Readable<string[]>;
    function customizeTextArea(el: HTMLTextAreaElement) {
        if (Platform.isIosApp) el.style.width = "100%";
        else if (Platform.isDesktopApp) {
            el.rows = 10;
        }
    }
</script>

<ObsidianInputWrapper
    {errors}
    name={field.name}
    label={field.label || field.name}
    description={field.description}
    className="modal-form-textarea"
>
    <textarea name={field.name} bind:value={$value} use:customizeTextArea />
</ObsidianInputWrapper>
