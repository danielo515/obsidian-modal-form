<script lang="ts">
    import Code from "./Code.svelte";
    import { type TemplateBuilderModel } from "./TemplateBuilder";

    export let model: TemplateBuilderModel;
    export let copyToClipboard: (content: string) => void;

    $: fields = model.fields;
    $: code = model.code;
    $: options = model.options;
</script>

<div class="modal-form flex flex-col gap-2">
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

    <div class="flex flex-col flex-1">
        <h3>Options</h3>
        <label>
            <input
                type="checkbox"
                checked={$options.includeFences}
                on:change={(e) => ($options.includeFences = e.currentTarget.checked)}
            />
            <span>Include frontmatter fences</span>
        </label>
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
