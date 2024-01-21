<script lang="ts">
    import { type FormImportModel } from "./FormImport";
    export let model: FormImportModel;
    const { state, validate } = model;
    let value: string = "";
    $: ui = model.uiState($state);
</script>

<div class="vertical mainView">
    <h1>Import a form</h1>
    <div>
        Import a form by pasting the JSON definition into the box below. You can export a form from
        the Form Builder. Any errors in the JSON will be displayed below. You will only be able to
        import the form if there are no errors.
    </div>
    <div class="horizontal full-height">
        <textarea
            bind:value
            class="form-input"
            placeholder="Paste your form JSON here"
            on:input={() => validate(value)}
        />

        <div class="vertical">
            {#if ui.errors.length > 0}
                <div class="vertical">
                    <p class="modal-form-danger">
                        We found the following errors in the form definition:
                    </p>
                    <div>
                        <ul>
                            {#each ui.errors as error}
                                <li>{error}</li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}

            <button class="btn btn-primary" on:click={ui.onSubmit} disabled={!ui.canSubmit}>
                Import {ui.buttonHint}
            </button>
        </div>
    </div>
</div>

<style>
    .vertical {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 1rem;
    }
    .full-height {
        height: 100%;
        flex: 1;
    }
    .horizontal {
        display: flex;
        flex-direction: row;
        height: 100%;
        gap: 0.5rem;
    }
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .mainView {
        padding: 0.8rem;
        min-height: 50vh;
    }
    p {
        margin: 0;
    }
    textarea {
        font-family: monospace;
        flex-grow: 1;
        flex-shrink: 0;
        flex-basis: 50%;
    }
</style>
