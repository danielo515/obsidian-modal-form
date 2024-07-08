<script lang="ts">
    import { Platform } from "obsidian";
    import type { FieldDefinition } from "src/core/formDefinition";
    import type { FieldValue } from "src/store/formStore";
    import type { Readable, Writable } from "svelte/store";
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
    label={field.label || field.name}
    description={field.description}
    className="modal-form-textarea"
>
    <textarea bind:value={$value} use:customizeTextArea />
</ObsidianInputWrapper>
