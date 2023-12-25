<script lang="ts">
    import { E, pipe, parseFunctionBody } from "@std";
    import FormRow from "./FormRow.svelte";

    export let body = "";
    export let index: number;
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
        This is a document block input. It is not meant to be used as a normal
        input, instead it is to render some instructions to the user. It is
        expected to be a function body that returns a string. Within the
        function body, you can access the form data using the <code>form</code>
        variable. For example:
        <pre class="language-js">{placeholder}</pre>
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
