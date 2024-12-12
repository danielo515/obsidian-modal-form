<script lang="ts">
    import { App, SearchComponent, Setting } from "obsidian";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formStore";
    import { FolderSuggest } from "src/suggesters/suggestFolder";
    import { Writable } from "svelte/store";
    import { useSetting } from "./useObsidianSetting";
    export let field: FieldDefinition;
    export let value: Writable<FieldValue>;
    export let parentFolder: string | undefined;
    export let app: App;
    let search_: SearchComponent | undefined;
    function customizer(setting: Setting) {
        setting.addSearch((component) => {
            new FolderSuggest(component.inputEl, app, parentFolder);
            search_ = component;
            component.onChange((v) => {
                $value = v.trim();
            });
        });
        setting.infoEl.appendChild(
            createSpan({
                cls: "setting-item-description",
                text: parentFolder ? `Searching in: ${parentFolder}` : "",
            }),
        );
    }
    $: if (search_) {
        search_.setValue($value as string);
    }
</script>

<div
    use:useSetting={{
        name: field.label || field.name,
        description: field.description || "",
        customizer,
    }}
>
    <span style="display: none;">dummy to prevent the setting from being the first child</span>
</div>
