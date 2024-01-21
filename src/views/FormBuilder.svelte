<script lang="ts">
    import {
        type EditableFormDefinition,
        type FormDefinition,
        isValidFormDefinition,
        validateFields,
        InputTypeReadable,
    } from "src/core/formDefinition";
    import { App, setIcon } from "obsidian";
    import InputBuilderDataview from "./components/inputBuilderDataview.svelte";
    import InputBuilderSelect from "./components/InputBuilderSelect.svelte";
    import InputFolder from "./components/InputFolder.svelte";
    import { log_error } from "src/utils/Log";
    import { ModalFormError } from "src/utils/ModalFormError";
    import FormRow from "./components/FormRow.svelte";
    import Toggle from "./components/Toggle.svelte";
    import TemplateEditor from "./components/TemplateEditor.svelte";
    import { A, pipe } from "@std";
    import Tabs from "./components/Tabs.svelte";
    import { ParsedTemplate, parsedTemplateToString } from "src/core/template/templateParser";
    import InputBuilderDocumentBlock from "./components/InputBuilderDocumentBlock.svelte";

    export let definition: EditableFormDefinition = {
        title: "",
        name: "",
        version: "1",
        fields: [],
    };
    export let onChange: () => void;
    export let onSubmit: (formDefinition: FormDefinition) => void;
    export let onCancel: () => void;
    export let onPreview: (formDefinition: FormDefinition) => void;
    export let app: App;
    let currentTab: "form" | "template" = "form";

    $: isValid = isValidFormDefinition(definition);
    $: errors = validateFields(definition.fields);
    $: activeFieldIndex = 0;
    $: fieldNames = pipe(
        definition.fields,
        A.map((f) => f.name),
    );

    function scrollWhenActive(element: HTMLElement, isActive: boolean) {
        function update(isActive: boolean) {
            if (isActive) {
                setTimeout(() => {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }, 100);
            }
        }
        update(isActive);
        return {
            update,
        };
    }

    function findFreeName(fieldIndex: number): string {
        const field = definition.fields[fieldIndex];
        if (!field) {
            log_error(
                new ModalFormError(
                    "Unexpected error, no field at that index",
                    fieldIndex + " leads to undefined",
                ),
            );
            return Date.now() + "";
        }
        let name = field.name;
        const allNames = definition.fields.map((f) => f.name);
        let i = 1;
        while (allNames.includes(name)) {
            name = `${field.name}_${i}`;
            i++;
        }
        return name;
    }

    function duplicateField(fieldIndex: number) {
        const field = definition.fields[fieldIndex];
        if (!field) {
            log_error(
                new ModalFormError(
                    "Unexpected error, no field at that index",
                    fieldIndex + " leads to undefined",
                ),
            );
            return;
        }
        const newField = {
            ...field,
            input: structuredClone(field.input),
            name: findFreeName(fieldIndex),
        };
        definition.fields.splice(fieldIndex + 1, 0, newField);
        definition.fields = definition.fields;
        onChange();
        activeFieldIndex = fieldIndex + 1;
    }

    function moveField(from: number, direction: "up" | "down") {
        const to = direction === "up" ? from - 1 : from + 1;
        if (to < 0 || to >= definition.fields.length) return;
        const tmp = definition.fields[from];
        const target = definition.fields[to];
        if (!target || !tmp) return;
        definition.fields[from] = target;
        definition.fields[to] = tmp;
        definition.fields = definition.fields;
        onChange();
        activeFieldIndex = to;
    }

    const handleSubmit = () => {
        if (!isValidFormDefinition(definition)) return;
        onSubmit(definition);
    };
    function saveTemplate(parsedTemplate: ParsedTemplate) {
        onSubmit({
            ...definition,
            template: { parsedTemplate, createCommand: true },
        });
    }
    const handlePreview = () => {
        if (!isValidFormDefinition(definition)) return;
        console.log("preview of", definition);
        onPreview(definition);
    };
</script>

<div class=" wrapper modal-form">
    <Tabs bind:activeTab={currentTab} tabs={["form", "template"]} />
    <div class="body">
        {#if currentTab === "template"}
            <div class="template">
                <TemplateEditor
                    formName={definition.name}
                    {fieldNames}
                    {saveTemplate}
                    templateString={definition.template
                        ? parsedTemplateToString(definition.template.parsedTemplate)
                        : ""}
                />
            </div>
        {:else}
            <form on:submit|preventDefault={handleSubmit}>
                <fieldset class="flex column gap2 header">
                    <label for="name">Form unique name</label>
                    <span class="hint"
                        >This name will identify this form uniquely, and will be the value you need
                        to provide when calling the method openForm</span
                    >
                    <input type="text" placeholder="Name" id="name" bind:value={definition.name} />
                    <label for="title">Form title</label>
                    <span class="hint"
                        >This is the title that will be shown in the modal when the form is visible</span
                    >
                    <input
                        type="text"
                        placeholder="Title"
                        id="title"
                        bind:value={definition.title}
                    />
                    <label for="customClassname">Custom class Name</label><span class="hint"
                        >In case you want to add a class name to the modal form to customize it</span
                    ><input
                        type="text"
                        id="customClassname"
                        bind:value={definition.customClassname}
                    />
                    <div class="flex row gap2">
                        <button
                            type="button"
                            on:click={() => {
                                definition.fields = [
                                    ...definition.fields,
                                    {
                                        name: "",
                                        label: "",
                                        description: "",
                                        input: { type: "text", allowUnknownValues: false },
                                    },
                                ];
                                // onChange();
                                activeFieldIndex = definition.fields.length - 1;
                            }}>Add more fields</button
                        >
                        <button type="button" on:click={handlePreview} disabled={!isValid}
                            >Preview</button
                        >
                        <button class="mod-cta" type="submit" disabled={!isValid}
                            >Save and close</button
                        >
                        <button type="button" class="mod-warning" on:click={onCancel}>Cancel</button
                        >
                    </div>
                    {#if errors.length > 0}
                        <h3 style="margin: 0;">
                            <span class="error">Form is invalid</span>, check the following:
                        </h3>
                        <ul style="margin: 0;">
                            {#each errors as error}
                                <li>
                                    {error.message}
                                    {#if error.path}
                                        at {error.path}
                                    {/if}
                                    <button
                                        type="button"
                                        on:click={() => {
                                            activeFieldIndex = error.index;
                                        }}>Go to problem</button
                                    >
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </fieldset>

                <fieldset class="flex column gap2 fields">
                    <h3>Fields</h3>
                    {#if definition.fields.length > 0}
                        {#each definition.fields as field, index}
                            {@const desc_id = `desc_${index}`}
                            {@const delete_id = `delete_${index}`}
                            <div
                                class="flex column md-row gap2"
                                use:scrollWhenActive={index === activeFieldIndex}
                            >
                                <div class="flex column gap1">
                                    <label for={`name_${index}`}>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        bind:value={field.name}
                                        id={`name_${index}`}
                                    />
                                </div>
                                <div class="flex column gap1">
                                    <label for={`label_${index}`}>Label</label>
                                    <input
                                        type="text"
                                        placeholder="Label"
                                        bind:value={field.label}
                                        id={`label_${index}`}
                                    />
                                </div>

                                {#if ["text", "email", "tel", "number", "note", "tag", "dataview", "multiselect"].includes(field.input.type)}
                                    <FormRow label="Make required" id={`required_${index}`}>
                                        <Toggle bind:checked={field.isRequired} tabindex={index} />
                                    </FormRow>
                                {/if}
                                <div class="flex column gap1">
                                    <label
                                        for={delete_id}
                                        style:visibility={"hidden"}
                                        style:overflow={"hidden"}
                                        style:white-space={"nowrap"}>delete {index}</label
                                    >
                                </div>
                            </div>

                            <div class="flex column md-row gap2">
                                <div class="flex column gap1">
                                    <label for={desc_id}>Description</label>
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        bind:value={field.description}
                                        id={desc_id}
                                    />
                                </div>
                                <div class="flex column gap1">
                                    <label for={`type_${index}`}>Type</label>
                                    <select bind:value={field.input.type} id={`type_${index}`}>
                                        {#each Object.entries(InputTypeReadable) as type}
                                            <option value={type[0]}>{type[1]}</option>
                                        {/each}
                                    </select>
                                </div>
                            </div>
                            <div class="flex gap1">
                                {#if field.input.type === "select"}
                                    <InputBuilderSelect
                                        {index}
                                        bind:source={field.input.source}
                                        bind:options={field.input.options}
                                        bind:folder={field.input.folder}
                                        notifyChange={onChange}
                                        is_multi={false}
                                        allowUnknownValues={false}
                                        {app}
                                    />
                                {:else if field.input.type === "multiselect"}
                                    <InputBuilderSelect
                                        {index}
                                        bind:source={field.input.source}
                                        bind:options={field.input.multi_select_options}
                                        bind:folder={field.input.folder}
                                        bind:query={field.input.query}
                                        bind:allowUnknownValues={field.input.allowUnknownValues}
                                        notifyChange={onChange}
                                        is_multi={true}
                                        {app}
                                    />
                                {:else if field.input.type === "slider"}
                                    {@const min_id = `min_${index}`}
                                    {@const max_id = `max_${index}`}
                                    <div class="flex column gap1">
                                        <label for={min_id}>Min</label>
                                        <input
                                            type="number"
                                            bind:value={field.input.min}
                                            placeholder="0"
                                            id={min_id}
                                        />
                                    </div>
                                    <div class="flex column gap1">
                                        <label for={max_id}>Max</label>
                                        <input
                                            type="number"
                                            bind:value={field.input.max}
                                            placeholder="10"
                                            id={max_id}
                                        />
                                    </div>
                                {:else if field.input.type === "note"}
                                    <InputFolder
                                        {index}
                                        bind:folder={field.input.folder}
                                        notifyChange={onChange}
                                    />
                                {:else if field.input.type === "dataview"}
                                    <InputBuilderDataview
                                        {index}
                                        bind:value={field.input.query}
                                        {app}
                                    />
                                {:else if field.input.type === "document_block"}
                                    <InputBuilderDocumentBlock
                                        {index}
                                        bind:body={field.input.body}
                                    />
                                {/if}
                            </div>
                            <div class="flex gap1">
                                <button
                                    type="button"
                                    disabled={index === 0}
                                    use:setIcon={"arrow-up"}
                                    on:click={() => moveField(index, "up")}
                                />
                                <button
                                    type="button"
                                    disabled={index === definition.fields.length - 1}
                                    use:setIcon={"arrow-down"}
                                    on:click={() => moveField(index, "down")}
                                />
                                <button type="button" on:click={() => duplicateField(index)}
                                    >Duplicate</button
                                >
                                <button
                                    use:setIcon={"trash"}
                                    type="button"
                                    id={delete_id}
                                    on:click={() => {
                                        definition.fields = definition.fields.filter(
                                            (_, i) => i !== index,
                                        );
                                    }}
                                />
                            </div>
                            <hr />
                        {/each}
                    {:else}
                        No fields yet
                    {/if}
                </fieldset>
            </form>
        {/if}
    </div>
</div>

<style>
    .wrapper,
    .body {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .wrapper {
        max-height: 100%;
        min-height: 100%;
        height: 100%;
        overflow: hidden;
    }
    .body {
        padding-top: 0.5rem;
        overflow-y: scroll;
    }
    .header {
        box-shadow: var(--shadow-bottom) var(--divider-color);
        padding: 1rem;
    }
    /* on bigger screens make the headers stick */
    @media (min-width: 58rem) {
        .body {
            overflow-y: hidden;
        }
        .fields {
            flex: 1;
            height: 100%;
        }
        form {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }
    }
    .template {
        padding: 1rem;
    }
    .fields {
        overflow-y: auto;
        padding: 1rem;
    }
    .flex {
        display: flex;
    }
    .column {
        flex-direction: column;
    }
    .gap1 {
        gap: 0.5rem;
    }
    .gap2 {
        gap: 1rem;
    }
    fieldset {
        border: none;
        padding: 0;
    }
    .hint {
        color: var(--color-base-70);
    }
    .error {
        color: var(--text-error);
        font-weight: bold;
    }
    button:disabled {
        opacity: 0.5;
        cursor: forbidden;
    }
    @media (min-width: 58rem) {
        .md-row {
            flex-direction: row;
        }
    }
</style>
