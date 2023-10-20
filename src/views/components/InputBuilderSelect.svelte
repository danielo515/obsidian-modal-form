<script lang="ts">
    /**
     * This component is specific for the input builder,
     * specifically to build the select input type
     */

    import { setIcon } from "obsidian";
    import FormRow from "./FormRow.svelte";
    import InputFolder from "./InputFolder.svelte";
    import type { EditableInput } from "src/core/formDefinition";

    export let index: number;
    export let source: string = "fixed";
    export let folder: string | undefined;
    export let options: EditableInput["options"] = [];
    export let notifyChange: () => void;
    export let is_multi: boolean;
    $: id = `builder_select_${index}`;
    $: options_id = `builder_select_options_btn_${index}`;
</script>

<FormRow label="Source" {id}>
    <select bind:value={source} {id}>
        <option value="fixed">Static</option>
        <option value="notes">Notes</option>
    </select>
</FormRow>
{#if source === "fixed"}
    <FormRow label="Options" id={options_id}>
        <button
            type="button"
            on:click={() => {
                if (is_multi) { 
                    options?.push("");
                } else {
                    options?.push({ value: "", label: "" });
                }
                options = options;
                notifyChange();
            }}>Add more options</button
        >
        {#each options || [] as option, idx}
            {@const value_id = `${options_id}_option_${idx}`}
            <div class="modal-form flex row gap1">
                {#if is_multi }
                <FormRow label="Value" id={value_id}>
                    <input
                        type="text"
                        placeholder="Value"
                        bind:value={option}
                        id={value_id}
                    /></FormRow
                >
                {:else}
                {@const label_id = `${options_id}_option_label_${idx}`}
                <FormRow label="Label" id={label_id}>
                    <input
                        type="text"
                        placeholder="Label"
                        bind:value={option.label}
                        id={label_id}
                    /></FormRow
                ><FormRow label="Value" id={value_id}>
                    <input
                        type="text"
                        placeholder="Value"
                        bind:value={option.value}
                        id={value_id}
                    /></FormRow
                >
                
                {/if}
                <FormRow
                    label="Delete"
                    id={"button" + value_id}
                    hideLabel={true}
                >
                    <button
                        id={"button" + value_id}
                        use:setIcon={"trash"}
                        type="button"
                        on:click={() => {
                            options = options?.filter((_, i) => i !== idx);
                            notifyChange();
                        }}
                    /></FormRow
                >
            </div>
        {/each}
    </FormRow>
{:else if source === "notes"}
    <InputFolder {index} bind:folder {notifyChange} />
{/if}

<style>
</style>
