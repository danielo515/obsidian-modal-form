<script lang="ts">
    import { App } from "obsidian";
    import { FormDefinition } from "src/core/formDefinition";
    import { makeFormEngine } from "src/store/formEngine";
    import RenderField from "./views/components/Form/RenderField.svelte";
    export let app: App;
    export let reportFormErrors: (errors: string[]) => void;
    export let formEngine: ReturnType<typeof makeFormEngine>;
    export let fields: FormDefinition["fields"];
    $: errors = formEngine.errors;
    $: $errors.length && reportFormErrors($errors);
</script>

{#each fields as definition}
    <RenderField {definition} model={formEngine.addField(definition)} {formEngine} {app} />
{/each}
