<script lang="ts">
    import Code from "./Code.svelte";
    import FormRow from "./FormRow.svelte";
    import Label from "./Label.svelte";
    import { type TemplateBuilderModel } from "./TemplateBuilder";

    export let model: TemplateBuilderModel;
    export let copyToClipboard: (content: string) => void;

    const templateMessage = `{{fieldName}} `;

    $: fields = model.fields;
    $: code = model.code;
    $: options = model.options;
    $: bodyTemplate = model.bodyTemplate;
</script>

<div class="modal-form flex flex-col gap-2">
    <h2 style="margin-bottom: 0;">Template for: {model.title}</h2>
    <div class="flex gap-2">
        <div class="flex gap-1 flex-col">
            <h3>Fields to exclude</h3>
            {#each $fields as field}
                <div>
                    <label class="flex gap-1">
                        <input
                            type="checkbox"
                            checked={field.omit}
                            on:change={(v) =>
                                model.setField(field.name, { omit: v.currentTarget.checked })}
                        />
                        <span>{field.name}</span>
                    </label>
                </div>
            {/each}
        </div>

        <div class="flex flex-col gap-1">
            <h3>Fields to include in frontmatter</h3>
            {#each $fields as field (field.name)}
                {#if field.omit === false}
                    <div>
                        <label class="flex gap-1">
                            <input
                                type="checkbox"
                                checked={field.onFrontmatter}
                                on:input={(v) =>
                                    model.setField(field.name, {
                                        onFrontmatter: v.currentTarget.checked,
                                    })}
                            />
                            <span>{field.name}</span>
                        </label>
                    </div>
                {/if}
            {/each}
            <label>
                <input
                    type="checkbox"
                    on:change={(e) => model.toggleAllFrontmatter(e.currentTarget.checked)}
                />
                All
            </label>
        </div>
    </div>

    <div class="flex flex-col gap-2">
        <h3>Body template</h3>
        <div>
            <p style="margin:0; padding:0">
                Whatever you write here will be used in the body part of the template (after the
                frontmatter).
            </p>
            <p style="margin:0; padding:0">
                You can use <span class="code">{templateMessage}</span> syntax to build the body of the
                template.
            </p>
        </div>
        <div class="flex gap-1">
            {#each $fields as field}
                <button type="button" on:click={() => ($bodyTemplate += `{{${field.name}}}\n`)}>
                    {field.name}
                </button>
            {/each}
        </div>
        <textarea class="w-full" rows="10" bind:value={$bodyTemplate} />
    </div>

    <div class="flex flex-col flex-1 gap-1">
        <h3>Options</h3>
        <Label label="Include frontmatter fences" inline>
            <input
                type="checkbox"
                checked={$options.includeFences}
                on:change={(e) => ($options.includeFences = e.currentTarget.checked)}
            />
        </Label>
        <FormRow label="Result variable name" id={`result_variable_name`} inline>
            <input
                type="text"
                value={$options.resultName}
                on:input={(e) => ($options.resultName = e.currentTarget.value)}
            />
        </FormRow>
    </div>
    <div class="flex flex-col flex-1">
        <h3>Template</h3>
        <div class="flex gap-1">
            <button type="button" on:click={() => copyToClipboard($code)}>
                Copy to clipboard
            </button>
            <!-- <button type="button"> Copy frontmatter to clipboard </button>
            <button type="button" disabled> Save as template </button> -->
        </div>
        <Code allowWrap>
            {$code}
        </Code>
    </div>
</div>

<style>
    .code {
        font-family: var(--font-family-monospace);
        background-color: var(--background-secondary);
        color: var(--text-muted);
    }
</style>
