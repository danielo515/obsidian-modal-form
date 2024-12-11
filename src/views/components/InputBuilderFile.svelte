<script lang="ts">
    import { App, Setting } from "obsidian";
    import { FolderSuggest } from "src/suggesters/suggestFolder";
    import FormRow from "./FormRow.svelte";

    export let index: number;
    export let folder: string = "";
    export let allowedExtensions: string[] = [];
    export let notifyChange: () => void;
    export let app: App;

    function searchFolder(element: HTMLElement) {
        const setting = new Setting(element)
            .setName("Save Location")
            .setDesc("Select the folder where files will be saved")
            .addSearch((search) => {
                search.setPlaceholder("Select a folder");
                search.setValue(folder);
                new FolderSuggest(search.inputEl, app);
                search.onChange((value) => {
                    folder = value;
                    notifyChange();
                });
            });
    }

    function handleExtensionsChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        allowedExtensions = value
            .split(",")
            .map((ext) => ext.trim())
            .filter((ext) => ext !== "")
            .map((ext) => ext.replace(/^\./, "")); // Remove leading dots if present
        notifyChange();
    }

    $: id = `file_input_${index}`;
    $: extensionsString = allowedExtensions.join(", ");
</script>

<div class="modal-form flex column gap1">
    <FormRow label="Save Location" {id}>
        <div
            class="modal-form flex column gap1 remove-padding remove-border fix-suggest"
            use:searchFolder
        >
            <span class="modal-form-hint"
                >Select the folder where files will be saved. The folder will be created if it
                doesn't exist.</span
            >
        </div>
    </FormRow>

    <FormRow label="Allowed Extensions" {id}>
        <input
            type="text"
            value={extensionsString}
            on:change={handleExtensionsChange}
            placeholder="pdf, doc, docx"
        />
        <span class="modal-form-hint">
            Enter file extensions separated by commas (e.g., pdf, doc, docx). Leave empty to allow all file types.
        </span>
    </FormRow>
</div>

<style>
    input {
        width: 100%;
    }

    .modal-form {
        padding: var(--size-4-2);
    }

    .modal-form-hint {
        color: var(--text-muted);
        font-size: var(--font-ui-smaller);
    }

    .gap1 {
        gap: var(--size-4-2);
    }

    .flex {
        display: flex;
    }

    .column {
        flex-direction: column;
    }

    .remove-padding {
        padding: 0;
    }

    .remove-border {
        border: none;
    }

    .fix-suggest :global(.setting-item) {
        border: none;
        padding: 0;
    }

    .fix-suggest :global(.setting-item-control) {
        justify-content: flex-start;
    }
</style>
