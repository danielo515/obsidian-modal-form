<script lang="ts">
    import { FormDefinition } from "src/core/formDefinition";
    import { makeModel, type TemplateBuilderModel } from "./TemplateBuilder";

    export let definition: FormDefinition;
    export let model: TemplateBuilderModel = makeModel(definition);

    $: fields = model.fields;
</script>

<div class="flex gap-2">
    <div>
        <h3>Fields to include in frontmatter</h3>
        {#each $fields as field}
            <div>
                <label>{field.name}</label>
                <input
                    type="checkbox"
                    on:input={(v) =>
                        model.setField(field.name, { onFrontmatter: v.currentTarget.checked })}
                />
            </div>
        {/each}
    </div>
    <div>
        <pre> 
            code here
        </pre>
    </div>
</div>
