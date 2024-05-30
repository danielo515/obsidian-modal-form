<script lang="ts">
    import Code from "./Code.svelte";
    import { type TemplateBuilderModel } from "./TemplateBuilder";

    export let model: TemplateBuilderModel;

    $: fields = model.fields;
    $: code = model.code;
</script>

<div class="modal-form flex gap-3">
    <div class="flex gap-2 flex-col">
        <h3>Fields to exclude</h3>
        {#each $fields as field}
            <div>
                <label
                    >{field.name}
                    <input
                        type="checkbox"
                        value={field.omit}
                        on:input={(v) =>
                            model.setField(field.name, { omit: !v.currentTarget.checked })}
                    />
                </label>
            </div>
        {/each}
    </div>

    <div class="flex flex-col">
        <h3>Fields to include in frontmatter</h3>
        {#each $fields as field}
            {#if field.omit === false}
                <div>
                    <label
                        >{field.name}
                        <input
                            type="checkbox"
                            value={field.onFrontmatter}
                            on:input={(v) =>
                                model.setField(field.name, {
                                    onFrontmatter: v.currentTarget.checked,
                                })}
                        />
                    </label>
                </div>
            {/if}
        {/each}
    </div>
    <div class="flex flex-col">
        <h3>Template</h3>
        <Code>
            {$code}
        </Code>
    </div>
</div>
