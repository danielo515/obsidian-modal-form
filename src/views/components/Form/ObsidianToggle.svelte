<script lang="ts">
    import { Setting, ToggleComponent } from "obsidian";
    import type { FieldDefinition } from "src/core/formDefinition";
    import type { FieldValue } from "src/store/formStore";
    import type { Writable } from "svelte/store";
    import { useSetting } from "./useObsidianSetting";
    export let field: FieldDefinition;
    export let value: Writable<FieldValue>;
    let toggle_: ToggleComponent | undefined;
    function customizer(setting: Setting) {
        setting.addToggle((toggle) => {
            toggle.onChange((v) => {
                $value = v;
            });
            toggle_ = toggle;
        });
    }
    $: if (toggle_) {
        toggle_.setValue($value as boolean);
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
