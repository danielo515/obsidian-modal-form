<script lang="ts">
    import { EditableField, FieldDefinition } from "src/core/formDefinition";
    import { slide } from "svelte/transition";
    import FormRow from "../FormRow.svelte";
    import Toggle from "../Toggle.svelte";
    import ConditionInput from "./ConditionInput.svelte";
    export let field: EditableField;
    export let availableFieldsForCondition: FieldDefinition[];
    export let index: number;
    let isConditional = !!field.condition || false;
    $: availableConditions = availableFieldsForCondition.filter((x) => x.name !== field.name);
    $: {
        if (isConditional) {
            field.condition = field.condition || {
                dependencyName: "",
                type: "isSet",
            };
        } else {
            field.condition = undefined;
        }
    }
    console.log({ FormRow, Toggle });
</script>

{#if availableConditions.length > 0}
    <div class="flex gap-2" transition:slide>
        <FormRow label="Conditional" id={`conditional-${index}`}>
            <Toggle bind:checked={isConditional} tabindex={index} />
        </FormRow>
        {#if field.condition !== undefined}
            <div class="flex gap-2" transition:slide>
                <ConditionInput
                    siblingFields={availableConditions}
                    name={field.name}
                    condition={field.condition}
                    onChange={(condition) => (field.condition = condition)}
                />
            </div>
        {/if}
    </div>
{/if}
