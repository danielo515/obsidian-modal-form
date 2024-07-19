<script lang="ts">
    import { input } from "@core";
    import { A, O, pipe } from "@std";
    import type { FieldDefinition } from "src/core/formDefinition";
    import FormRow from "../FormRow.svelte";
    import { getInitialInputValues, makeModel } from "./ConditionInput";

    export let siblingFields: FieldDefinition[];
    export let name: string;
    export let condition: input.Condition;
    export let onChange: (condition: input.Condition) => void;
    const model = makeModel(siblingFields, condition, onChange);
    $: conditions = model.conditionTypeOptions;
    $: conditionType = model.conditionType;
    $: dependencyName = model.dependencyName;
    $: valueField = model.valueField;
    $: console.log(name, $conditions, $dependencyName, $valueField);
    let { booleanValue, numberValue, textValue } = getInitialInputValues(condition);
    $: {
        pipe(
            $conditions,
            O.chain((conditions) =>
                // if the current condition is not in the list of available conditions, set it to the first available condition
                conditions.includes($conditionType) ? O.none : A.head(conditions),
            ),
            O.map((newVAlue) => {
                $conditionType = newVAlue;
            }),
        );
        if (O.isSome($valueField)) {
            // By the time we are able to set a value, the condition is complete so we can submit it
            // Using each of the set functions will ensure type safety
            if ($valueField.value.type === "dropdown") $valueField.value.set(booleanValue);
            if ($valueField.value.type === "text") $valueField.value.set(textValue);
            if ($valueField.value.type === "number") $valueField.value.set(numberValue);
        }
    }
    $: {
        if ($conditionType === "isSet") {
            // This is the only case where we can submit a condition without a value
            if ($dependencyName !== condition.dependencyName && $dependencyName !== undefined)
                onChange({ type: "isSet", dependencyName: $dependencyName });
        }
    }
</script>

<FormRow label="When field" id="sibling-field-of-{name}">
    <select bind:value={$dependencyName} class="dropdown">
        {#each siblingFields as field}
            <option value={field.name}
                >{field.name}
                {#if field.label}
                    ({field.label})
                {/if}
            </option>
        {/each}
    </select>
</FormRow>

{#if O.isSome($conditions)}
    <FormRow label="Condition" id="condition-{name}">
        <select class="dropdown" bind:value={$conditionType}>
            {#each $conditions.value as option}
                <option value={option}>
                    {option}
                </option>
            {/each}
        </select>
    </FormRow>
{/if}
{#if O.isSome($valueField)}
    <FormRow label="Value" id="condition-value-{name}">
        {#if $valueField.value.type === "text"}
            <input type="text" class="input" bind:value={textValue} />
        {:else if $valueField.value.type === "number"}
            <input type="number" class="input" bind:value={numberValue} />
        {:else if $valueField.value.type === "dropdown"}
            <select class="dropdown" bind:value={booleanValue}>
                {#each $valueField.value.options as option}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        {/if}
    </FormRow>
{/if}
