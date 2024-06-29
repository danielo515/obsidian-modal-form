<script lang="ts">
    import { input as I } from "@core";
    import { Setting } from "obsidian";
    import { FieldDefinition } from "src/core/formDefinition";
    import { FieldValue } from "src/store/formStore";
    import { Writable } from "svelte/store";
    export let field: FieldDefinition;
    export let input: I.inputSelectFixed;
    export let value: Writable<FieldValue>;
    let setting: Setting;
    function addDropdown(element: HTMLElement) {
        setting = new Setting(element)
            .addDropdown((dropdown) => {
                input.options.forEach((option) => {
                    dropdown.addOption(option.value, option.label);
                });
                dropdown.onChange((v) => {
                    $value = v;
                });
            })
            .setName(field.name)
            .setDesc(field.description);
    }
</script>

<div use:addDropdown></div>
