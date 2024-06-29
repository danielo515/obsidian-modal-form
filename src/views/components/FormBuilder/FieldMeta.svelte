<script lang="ts">
    import { EditableField, FieldDefinition } from "src/core/formDefinition";
    import { slide } from "svelte/transition";
    import FormRow from "../FormRow.svelte";
    import Toggle from "../Toggle.svelte";
    import ConditionInput from "./ConditionInput.svelte";
    export let field: EditableField;
    export let availableFieldsForCondition: FieldDefinition[];
    export let index: number;
    let isConditional = false;
    $: availableConditions = availableFieldsForCondition.filter((x) => x.name !== field.name);
    $: {
        if (isConditional && !field.condition) {
            field.condition = {
                field: "",
                type: "isSet",
            };
        }
    }
</script>

{#if availableConditions.length > 0}
    <div class="flex gap-2" transition:slide>
        <FormRow label="Make conditional" id={`conditional-${index}`}>
            <Toggle bind:checked={isConditional} tabindex={index} />
        </FormRow>
        {#if field.condition !== undefined && isConditional}
            <div class="flex gap-2" transition:slide>
                <ConditionInput
                    siblingFields={availableConditions}
                    name={field.name}
                    bind:value={field.condition}
                />
            </div>
        {/if}
    </div>
{/if}
