<script lang="ts">
    import FormRow from "./FormRow.svelte";

    let text = "";
    const id = "document_block";
    const placeholder = "return `Hello ${form.name}!`";
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
            bind:value={text}
            name="document_block"
            class="form-control"
            rows="3"
            {placeholder}
        />
    </span></FormRow
>
