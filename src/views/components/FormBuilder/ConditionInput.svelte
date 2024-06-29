<script lang="ts">
    import { input } from "@core";
    import { FieldDefinition } from "src/core/formDefinition";
    import FormRow from "../FormRow.svelte";

    export let siblingFields: FieldDefinition[];
    export let name: string;
    export let value: input.Condition;
    let selectedTargetField: FieldDefinition | undefined = undefined;
    let selectedCondition: input.ConditionType | undefined = undefined;
    let textValue = "";
    let numberValue = 0;
    $: conditions =
        // Why? to trigger svelte reactivity on fields changes
        siblingFields && selectedTargetField
            ? input.availableConditionsForInput(selectedTargetField.input)
            : [];
    $: {
        if (selectedCondition && selectedTargetField) {
            const field = selectedTargetField?.name;
            switch (selectedCondition) {
                case "isSet":
                    value = {
                        field,
                        type: "isSet",
                    };
                    break;
                case "boolean":
                    value = { field, type: "boolean", value: false };
                    break;
                case "startsWith":
                case "contains":
                    value = {
                        field,
                        type: selectedCondition,
                        value: textValue,
                    };
                    break;
                case "above":
                case "below":
                    value = {
                        field,
                        type: selectedCondition,
                        value: numberValue,
                    };
            }
        }
    }
</script>

<FormRow label="When field" id="sibling-field-of-{name}">
    <select bind:value={selectedTargetField} class="dropdown">
        {#each siblingFields as field}
            <option value={field}
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
{#if selectedCondition && selectedCondition !== "isSet"}
    <FormRow label="Value" id="condition-value-{name}">
        {#if selectedCondition === "contains" || selectedCondition === "startsWith"}
            <input type="text" class="input" bind:value={textValue} />
        {:else if selectedCondition === "above" || selectedCondition === "below"}
            <input type="number" class="input" bind:value={numberValue} />
        {/if}
    </FormRow>
{/if}
