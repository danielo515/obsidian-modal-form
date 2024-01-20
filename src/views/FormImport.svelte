<script lang="ts">
    import { type FormImportModel } from "./FormImport";
    export let model: FormImportModel;
    const { errors, validate } = model;
    let value: string = "";
    $: isValid = $errors.length === 0;
</script>

<div class="vertical mainView">
    <p>
        Import a form by pasting the JSON definition into the box below. You can export a form from
        the Form Builder. Any errors in the JSON will be displayed below. You will only be able to
        import the form if there are no errors.
    </p>
    <div class="horizontal">
        <textarea
            bind:value
            class="form-input"
            placeholder="Paste your form JSON here"
            rows={10}
            cols={100}
            on:input={() => validate(value)}
        />

        <div class="vertical">
            {#if $errors.length > 0}
                <div class="vertical">
                    <p class="modal-form-danger">
                        We found the following errors in the form definition:
                    </p>
                    <div>
                        <ul>
                            {#each $errors as error}
                                <li>{error}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}

            <button
                class="btn btn-primary"
                on:click={() => model.import(value)}
                disabled={!isValid}
            >
                Import {isValid ? "✅" : " (fix errors first)"}
            </button>
        </div>
    </div>
</div>

<style>
    .vertical {
        display: flex;
        flex-direction: column;
    }
    .horizontal {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .mainView {
        padding: 1rem;
        min-height: 50vh;
    }
    p {
        margin: 0;
    }
</style>
