<script lang="ts">
    import { type TemplateBuilderModel } from "./TemplateBuilder";

    export let model: TemplateBuilderModel;

    $: fields = model.fields;
    $: code = model.code;
</script>

<div class="modal-form flex gap-2">
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
            {$code}
        </pre>
    </div>
</div>
