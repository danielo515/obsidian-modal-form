<script lang="ts">
    import { input } from "@core";
    import { absurd } from "fp-ts/lib/function";
    import { FieldDefinition } from "src/core/formDefinition";
    import FormRow from "../FormRow.svelte";

    export let siblingFields: FieldDefinition[];
    export let name: string;
    export let value: input.Condition;
    let selectedTargetField: FieldDefinition | undefined = undefined;
    let selectedCondition: input.ConditionType | undefined = undefined;
    let textValue = "";
    let numberValue = 0;
    let booleanValue = false;
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
            const field = selectedTargetField?.name;
            switch (selectedCondition) {
                case "isSet":
                    value = {
                        dependencyName: field,
                        type: "isSet",
                    };
                    break;
                case "boolean":
                    value = { dependencyName: field, type: "boolean", value: booleanValue };
                    break;
                case "startsWith":
                case "contains":
                case "endsWith":
                case "isExactly":
                    value = {
                        dependencyName: field,
                        type: selectedCondition,
                        value: textValue,
                    };
                    break;
                case "above":
                case "below":
                case "aboveOrEqual":
                case "belowOrEqual":
                case "exactly":
                    value = {
                        dependencyName: field,
                        type: selectedCondition,
                        value: numberValue,
                    };
                    break;
                default:
                    absurd(selectedCondition);
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
