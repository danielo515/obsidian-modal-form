<script lang="ts">
    import { input } from "@core";
    import { FieldDefinition } from "src/core/formDefinition";
    import FormRow from "../FormRow.svelte";

    export let siblingFields: FieldDefinition[];
    export let name: string;
    let selectedTargetField: input.Input | undefined = undefined;
    let selectedCondition: input.ConditionType | undefined = undefined;
    $: conditions =
        // Why? to trigger svelte reactivity on fields changes
        siblingFields && selectedTargetField
            ? input.availableConditionsForInput(selectedTargetField)
            : [];
</script>

<FormRow label="When field" id="sibling-field-of-{name}">
    <select bind:value={selectedTargetField} class="dropdown">
        {#each siblingFields as field}
            <option value={field.input}
                >{field.name}
                {#if field.label}
                    ({field.label})
                {/if}
            </option>
        {/each}
    </select>
</FormRow>

{#if conditions.length > 0}
    <FormRow label="Condition" id="condition-{name}">
        <select bind:value={selectedCondition} class="dropdown">
            {#each conditions as condition}
                <option value={condition}>{condition}</option>
            {/each}
        </select>
    </FormRow>
{/if}
{#if selectedCondition}
    {#if selectedCondition === "contains" || selectedCondition === "startsWith"}
        <FormRow label="Value" id="condition-value-{name}">
            <input type="text" class="input" />
        </FormRow>
    {:else if selectedCondition === "above" || selectedCondition === "below"}
        <FormRow label="Value" id="condition-value-{name}">
            <input type="number" class="input" />
        </FormRow>
    {/if}
{/if}
