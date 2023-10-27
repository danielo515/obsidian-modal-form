<script lang="ts">
    import { FormDefinition, MigrationError } from "src/core/formDefinition";

    export let createNewForm: () => void;
    export let deleteForm: (formName: string) => void;
    export let duplicateForm: (form: FormDefinition) => void;
    export let editForm: (formName: string) => void;

    export let forms: FormDefinition[];
    export let invalidForms: MigrationError[] = [];
    function handleDeleteForm(formName: string) {
        const confirmed = confirm(`Are you sure you want to delete ${formName}?`);
        if (confirmed) { console.log(`Deleting ${formName}`); }
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
    }
</script>

<h3>Manage forms</h3>

<button class="form-add-button" on:click={() => createNewForm()}>
    Add new form
</button>

<div id="form-rows">
    {#each forms as form}
        <div class="form-row">
            <h4>{form.name}</h4>
            <div class="form-row-buttons">
                <button
                    class="form-row-button form-row-delete"
                    on:click={() => handleDeleteForm(form.name)}
                >
                    <i class="fa fa-trash"></i>
                    <span>Delete</span>
                </button>
                <button
                    class="form-row-button form-row-edit"
                    on:click={() => handleEditForm(form.name)}
                >
                    <i class="fa fa-edit"></i>
                    <span>Edit</span>
                </button>
                <button
                    class="form-row-button form-row-duplicate"
                    on:click={() => handleDuplicateForm(form)}
                >
                    <i class="fa fa-copy"></i>
                    <span>Duplicate</span>
                </button>
                <button
                    class="form-row-button form-row-copy"
                    on:click={() => handleCopyForm(form)}
                >
                    <i class="fa fa-clipboard"></i>
                    <span>Copy</span>
                </button>
            </div>
        </div>
    {/each}
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

    .form-row-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
    }

    .form-row-button:hover {
        background-color: var(--background-modifier-hover);
    }

    .form-row-delete {
        color: var(--text-danger);
        background-color: var(--background-danger);
    }

    .form-row-delete:hover {
        background-color: var(--background-danger-hover);
    }

    .form-row-edit {
        color: var(--text-accent);
        background-color: var(--background-accent);
    }

    .form-row-edit:hover {
        background-color: var(--background-accent-hover);
    }

    .form-row-duplicate {
        color: var(--text-primary);
        background-color: var(--background-primary);
    }

    .form-row-duplicate:hover {
        background-color: var(--background-primary-hover);
    }

    .form-row-copy {
        color: var(--text-accent);
        background-color: var(--background-accent);
    }

    .form-row-copy:hover {
        background-color: var(--background-accent-hover);
    }
</style>
