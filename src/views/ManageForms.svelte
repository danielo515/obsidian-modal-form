<script lang="ts">
    import { FormDefinition } from "src/core/formDefinition";
    import KeyValue from "./components/KeyValue.svelte";
    import Button from "./components/Button.svelte";
    import { MigrationError } from "src/core/formDefinitionSchema";
    import { is } from "valibot";
    import { isLeft } from "fp-ts/lib/Either";
    import { E } from "@std";
    import { right } from "fp-ts/lib/Separated";

    export let createNewForm: () => void;
    export let deleteForm: (formName: string) => void;
    export let duplicateForm: (form: FormDefinition) => void;
    export let editForm: (formName: string) => void;
    export let copyFormToClipboard: (form: FormDefinition) => void;

    export let forms: FormDefinition[];
    export let invalidForms: MigrationError[] = [];
    function handleDeleteForm(formName: string) {
        const confirmed = confirm(
            `Are you sure you want to delete ${formName}?`,
        );
        if (confirmed) {
            console.log(`Deleting ${formName}`);
            deleteForm(formName);
        }
    }
    function handleEditForm(formName: string) {
        console.log(`Editing ${formName}`);
        editForm(formName);
    }
    function handleDuplicateForm(form: FormDefinition) {
        console.log(`Duplicating ${form.name}`);
        duplicateForm(form);
    }
    function handleCopyForm(form: FormDefinition) {
        console.log(`Copying ${form.name}`);
        copyFormToClipboard(form);
    }
</script>

<div class="header">
    <h1>Manage forms</h1>
    <Button onClick={createNewForm} text="Create new form" variant="primary"
    ></Button>
    {#if invalidForms.length}
        <h5 class="modal-form-danger">
            There are {invalidForms.length} invalid forms.
        </h5>
        <p>
            Please take a look at the invalid forms section for details and
            potential fixes.
        </p>
    {/if}
</div>

<div id="form-rows">
    {#each forms as form}
        <div class="form-row">
            <h4 class="form-name">{form.name}</h4>
            <div>
                {#each Object.entries(form) as [key, value]}
                    {#if key !== "name"}
                        <KeyValue {key}>
                            <span
                                >{Array.isArray(value)
                                    ? value.length
                                    : value}</span
                            >
                        </KeyValue>
                    {/if}
                {/each}
                <KeyValue key="Field names">
                    <span style="display: flex; flex-direction: column;">
                        {#each form.fields as field}
                            <span>{field.name}</span>
                        {/each}</span
                    >
                </KeyValue>
            </div>
            <div class="form-row-buttons">
                <Button
                    onClick={() => handleDeleteForm(form.name)}
                    tooltip={`Delete ${form.name}`}
                    icon="trash"
                    variant="danger"
                ></Button>
                <Button
                    onClick={() => handleEditForm(form.name)}
                    text="Edit"
                    variant="primary"
                    icon="pencil"
                ></Button>
                <button on:click={() => handleDuplicateForm(form)}>
                    <span>Duplicate</span>
                </button>
                <Button
                    tooltip={`Copy ${form.name} to clipboard`}
                    icon="clipboard-copy"
                    onClick={() => handleCopyForm(form)}
                ></Button>
            </div>
        </div>
    {/each}
    {#if invalidForms.length}
        <h3 class="form-name modal-form-danger">Invalid forms</h3>
        <div>
            {#each invalidForms as form}
                <div class="form-row">
                    <h4 class="form-name">{form.name}</h4>
                    {#each form.fieldErrors as error}
                        <div class="flex-row">
                            {#if E.isLeft(error)}
                                <pre><code>
                                    {JSON.stringify(error.left.field, null, 1)}
                                </code></pre>
                                <KeyValue key={error.left.path}>
                                    {#each error.left.getFieldErrors() as fieldError}
                                        <span>{fieldError}</span>
                                    {/each}
                                </KeyValue>
                                <hr />
                            {:else}
                                <KeyValue key="field">
                                    <span>{error.right.name} ✅</span>
                                </KeyValue>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .form-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-row-buttons {
        display: flex;
        gap: 8px;
    }
    .form-name {
        margin-bottom: 0;
    }
    .header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
    }
    h5 {
        margin-bottom: 0;
    }
    .flex-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
    }
    pre {
        white-space: pre-wrap;
    }
</style>
