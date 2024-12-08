<script lang="ts">
    import { App, Setting } from "obsidian";
    import { FolderSuggest } from "src/suggesters/suggestFolder";
    import FormRow from "./FormRow.svelte";

    export let index: number;
    export let saveLocation: string = "";
    export let filenameTemplate: string = "";
    export let notifyChange: () => void;
    export let app: App;

    function searchFolder(element: HTMLElement) {
        const setting = new Setting(element)
            .setName("Save Location")
            .setDesc("Select the folder where images will be saved")
            .addSearch((search) => {
                search.setPlaceholder("Select a folder");
                search.setValue(saveLocation);
                new FolderSuggest(search.inputEl, app);
                search.onChange((value) => {
                    saveLocation = value;
                    notifyChange();
                });
            });
    }

    $: id = `image_input_${index}`;

    const date = "{{date}}";
    const time = "{{time}}";
    const datetime = "{{datetime}}";
</script>

<div class="modal-form flex column gap1">
    <FormRow label="Save Location" {id}>
        <div
            class="modal-form flex column gap1 remove-padding remove-border fix-suggest"
            use:searchFolder
        >
            <span class="modal-form-hint"
                >Select the folder where images will be saved. The folder will be created if it
                doesn't exist.</span
            >
        </div>
    </FormRow>

    <FormRow label="Filename Template" {id}>
        <input
            type="text"
            bind:value={filenameTemplate}
            on:change={notifyChange}
            placeholder="image-{{ datetime }}.png"
            class="form-control"
        />
        <div class="modal-form-hint">
            Available placeholders:
            <ul>
                <li><code>{date}</code> - Current date (YYYY-MM-DD)</li>
                <li><code>{time}</code> - Current time (HH-mm-ss)</li>
                <li>
                    <code>{datetime}</code> - Current date and time (YYYY-MM-DD-HH-mm-ss)
                </li>
            </ul>
            Example:<code>screenshot-{datetime}.png</code> will create:
            <code>screenshot-2024-12-08-19-29-52.png</code>
        </div>
    </FormRow>
</div>

<style>
    ul {
        margin: 0;
        padding-left: 1em;
    }
    code {
        font-family: var(--font-monospace);
        background-color: var(--background-modifier-form-field);
        padding: 0.1em 0.3em;
        border-radius: 3px;
    }
</style>
