<script lang="ts">
    import { App } from "obsidian";
    import type { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine } from "src/store/formStore";
    import { onMount } from "svelte";
    import RenderField from "./views/components/Form/RenderField.svelte";
    const {
        app,
        reportFormErrors,
        formEngine,
        fields,
    }: {
        app: App;
        reportFormErrors: (errors: string[]) => void;
        formEngine: ReturnType<typeof makeFormEngine>;
        fields: FormDefinition["fields"];
    } = $props();
    onMount(() =>
        formEngine.errors.subscribe((errors) => {
            if (errors.length > 0) reportFormErrors(errors);
        }),
    );
</script>

{#each fields as definition}
    <RenderField {definition} model={formEngine.addField(definition)} {formEngine} {app} />
{/each}
