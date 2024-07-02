<script lang="ts">
    import { input } from "@core";
    import { absurd } from "fp-ts/lib/function";
    import { FieldDefinition } from "src/core/formDefinition";
    import FormRow from "../FormRow.svelte";
    import { buildCondition } from "./ConditionInput";

    export let siblingFields: FieldDefinition[];
    export let name: string;
    export let condition: input.Condition;
    export let onChange: (condition: input.Condition) => void;
    let selectedTargetField: FieldDefinition | undefined = siblingFields.find(
        (x) => x.name === condition.dependencyName,
    );
    $: selectedCondition = condition.type;
    let textValue = "";
    let numberValue = 0;
    let booleanValue = false;
    // $: selectedTargetField = siblingFields.find((x) => x.name === value.dependencyName);
    $: conditions =
        // Why? to trigger svelte reactivity on fields changes
        siblingFields && selectedTargetField
            ? input.availableConditionsForInput(selectedTargetField.input)
            : [];
    $: {
        if (selectedTargetField?.input.type === "toggle") {
            selectedCondition = "boolean";
        }
    }
    $: {
        if (selectedCondition && selectedTargetField) {
            const newCondition = buildCondition(
                selectedCondition,
                selectedTargetField.name,
                booleanValue,
                textValue,
                numberValue,
            );
            console.log({ newCondition });
            if (!input.ConditionEq.equals(newCondition, condition)) onChange(newCondition);
        }
    }
    $: console.log({ conditions, selectedCondition, selectedTargetField, siblingFields, name });
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
        {#if selectedTargetField?.input.type === "toggle"}
            <select class="dropdown" disabled>
                <option value="boolean">is</option>
            </select>
        {:else}
            <select bind:value={selectedCondition} class="dropdown">
                {#each conditions as condition}
                    <option value={condition}>
                        {condition}
                    </option>
                {/each}
            </select>
        {/if}
    </FormRow>
{/if}
{#if selectedCondition && selectedCondition !== "isSet"}
    <FormRow label="Value" id="condition-value-{name}">
        {#if selectedCondition === "contains" || selectedCondition === "startsWith" || selectedCondition === "endsWith" || selectedCondition === "isExactly"}
            <input type="text" class="input" bind:value={textValue} />
        {:else if selectedCondition === "above" || selectedCondition === "below" || selectedCondition === "aboveOrEqual" || selectedCondition === "belowOrEqual" || selectedCondition === "exactly"}
            <input type="number" class="input" bind:value={numberValue} />
        {:else if selectedCondition === "boolean"}
            <select bind:value={booleanValue} class="dropdown">
                <option value={false}>False</option>
                <option value={true}>True</option>
            </select>
        {:else}
            {absurd(selectedCondition)}
        {/if}
    </FormRow>
{/if}
