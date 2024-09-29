<script lang="ts">
    import { E, parseFunctionBody, pipe } from "@std";
    import FormRow from "./FormRow.svelte";

    export let body = "";
    export let index: number;
    export let flavour: "markdown" | "html";
    $: id = "document_block_" + index;
    const placeholder = "return `Hello ${form.name}!`";
    $: errors = pipe(
        parseFunctionBody(body),
        E.fold(
            (e) => e.message,
            () => "",
        ),
    );
    $: console.log(errors);
</script>

<FormRow label="Document block" {id}>
    <span class="modal-form-hint">
        {#if flavour === "markdown"}
            This is markdown block. It is not a real input, it is used to render some markdown
            inside your form.
        {:else}
            This is a document block input. It is not meant to be used as a normal input, instead it
            is to render some instructions to the user.
        {/if}
        It is expected to contain a function body that returns a string. Within the function body, you
        can access the form data using the <code>form</code>
        variable. For example:
        <pre class="language-js">{placeholder}</pre>
        <p>
            You also have access to the Dataview API through the <code>dv</code> variable.
        </p>
        <textarea
            bind:value={body}
            name="document_block"
            class="form-control"
            rows="3"
            {placeholder}
        />
        {#if errors}
            Your function body has errors:
            <div class="modal-form-error-message">{errors}</div>
        {/if}
    </span></FormRow
>

<style>
    code {
        border: 1px solid var(--divider-color);
        padding: 2px 4px;
    }
    textarea {
        width: 100%;
    }
</style>
