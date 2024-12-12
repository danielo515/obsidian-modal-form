<script lang="ts">
    /**
     * This component is specific for the input builder,
     * specifically to build the select input type
     */
    type option = { label: string; value: string } | string;

    import { input } from "@core";
    import { App, setIcon } from "obsidian";
    import { AllSources } from "src/core/formDefinition";
    import FormRow from "./FormRow.svelte";
    import InputFolder from "./InputBuilderFolder.svelte";
    import InputBuilderDataview from "./inputBuilderDataview.svelte";

    export let index: number;
    export let source: AllSources = "fixed";
    export let query: string = "";
    export let folder: string | undefined;
    export let allowUnknownValues: boolean = false;
    export let options: option[] = [];
    export let app: App;
    export let notifyChange: () => void;
    export let is_multi: boolean;
    $: id = `builder_select_${index}`;
    $: options_id = `builder_select_options_btn_${index}`;
    $: showAllowUnknownValuesOption =
        is_multi && input.canAllowUnknownValues("multiselect", source);

    function moveOption(from: number, direction: "up" | "down") {
        const to = direction === "up" ? from - 1 : from + 1;
        if (to < 0 || to >= options.length) return;
        const tmp = options[from];
        const target = options[to];
        if (!target || !tmp) return;
        options[from] = target;
        options[to] = tmp;
        options = options;
        notifyChange();
    }
</script>

<FormRow label="Source" {id}>
    <select bind:value={source} {id}>
        <option value="fixed">Static</option>
        <option value="notes">Notes</option>
        {#if is_multi}
            <!-- For now, only multi-select allows for dataview  -->
            <option value="dataview">Dataview</option>
        {/if}
    </select>
    {#if showAllowUnknownValuesOption}
        <label class="unknown-checkbox">
            <span>
                <input type="checkbox" bind:checked={allowUnknownValues} />
                Allow unknown values.
            </span>
            <span class="modal-form-hint">
                If checked, the user will be able to type any value in the input even if it is not
                in the list of options.
            </span>
        </label>
    {/if}
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
                <FormRow label="Button" id={"button-up" + value_id} hideLabel={true}>
                    <button
                        type="button"
                        disabled={idx === 0}
                        use:setIcon={"arrow-up"}
                        on:click={() => moveOption(idx, "up")}
                    /></FormRow
                >
                <FormRow label="Button" id={"button-down" + value_id} hideLabel={true}>
                    <button
                        type="button"
                        disabled={idx === options?.length - 1}
                        use:setIcon={"arrow-down"}
                        on:click={() => moveOption(idx, "down")}
                    /></FormRow
                >
                {#if "string" == typeof option}
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
                <FormRow label="Delete" id={"button" + value_id} hideLabel={true}>
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
    <InputFolder {index} bind:folder {notifyChange} {app} />
{:else if source === "dataview"}
    <InputBuilderDataview {index} bind:value={query} {app} />
{/if}

<style>
    button:disabled {
        opacity: 0.5;
        cursor: forbidden;
    }
    .unknown-checkbox {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
</style>
