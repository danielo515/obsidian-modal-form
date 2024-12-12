<script lang="ts">
    import { App, Setting } from "obsidian";
    import { FolderSuggest } from "src/suggesters/suggestFolder";
    /**
     * This component is just to select a folder, not notes inside the folder
     */
    export let index: number;
    export let folder: string | undefined;
    export let app: App;
    // This is just used to notify the parent component that the value has changed
    // it is useful for example to persis the intermediary state of the form
    export let notifyChange: () => void;
    function searchFolder(element: HTMLElement) {
        new Setting(element).addSearch((search) => {
            search.setPlaceholder("Select a folder");
            search.setValue(folder || "");
            new FolderSuggest(search.inputEl, app);
            search.onChange((value) => {
                folder = value.trim() || undefined;
                notifyChange();
            });
        });
    }
    $: id = `input_folder_${index}`;
</script>

<!-- The autocomplete input will be inside the first div, so we remove some styles with the utility classes -->
<div class="modal-form flex column gap1 remove-padding remove-border fix-suggest" use:searchFolder>
    <label for={id}>Source Folder</label>
</div>

<style>
</style>
