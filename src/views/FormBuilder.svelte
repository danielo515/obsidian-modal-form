<script lang="ts">
	import {
		isSelectFromNotes,
		type EditableInput,
		type EditableFormDefinition,
		type FormDefinition,
		isValidFormDefinition,
	} from "src/core/formDefinition";
	import { FolderSuggest } from "src/suggestFolder";
	import { FieldTypeReadable } from "src/EditFormView";
	import { setIcon, Setting, App } from "obsidian";
	import FormRow from "./components/FormRow.svelte";

	export let definition: EditableFormDefinition = {
		title: "",
		name: "",
		fields: [],
	};
	export let app: App;
	export let onChange: () => void;
	export let onSubmit: (formDefinition: FormDefinition) => void;

	$: isValid = isValidFormDefinition(definition);

	function folderField(element: HTMLElement, index: number) {
		const field = definition.fields[index];
		const inputType = field.input;
		if (!isSelectFromNotes(inputType)) return;

		new Setting(element).addSearch((search) => {
			search.setPlaceholder("Select a folder");
			search.setValue(inputType.folder);
			new FolderSuggest(search.inputEl, app);
			search.onChange((value) => {
				inputType.folder = value;
				onChange();
			});
		});
	}

	const handleSubmit = () => {
		if (!isValidFormDefinition(definition)) return;
		onSubmit(definition);
	};
</script>

<div class="flex column gap2">
	<form on:submit|preventDefault={handleSubmit}>
		<fieldset class="flex column gap2">
			<label for="name">Form unique name</label>
			<span class="hint"
				>This name will identify this form uniquely, and will be the
				value you need to provide when calling the method openForm</span
			>
			<input
				type="text"
				placeholder="Name"
				id="name"
				bind:value={definition.name}
			/>
			<label for="title">Form title</label>
			<span class="hint"
				>This is the title that will be shown in the modal when the form
				is visible</span
			>
			<input
				type="text"
				placeholder="Title"
				id="title"
				bind:value={definition.title}
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
								input: { type: "text" },
							},
						];
						onChange();
					}}>Add more fields</button
				>
				<button type="submit" disabled={!isValid}>Save</button>
			</div>
		</fieldset>

		<h3>Fields</h3>
		{#if definition.fields.length > 0}
			<fieldset class="flex column gap2 p-2">
				{#each definition.fields as field, index}
					{@const desc_id = `desc_${index}`}
					{@const delete_id = `delete_${index}`}
					<div class="flex column md-row gap2">
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

						<div class="flex column gap1">
							<label
								for={delete_id}
								style:visibility={"hidden"}
								style:overflow={"hidden"}
								style:white-space={"nowrap"}
								>delete {index}</label
							>
							<button
								use:setIcon={"trash"}
								type="button"
								id={delete_id}
								on:click={() => {
									definition.fields =
										definition.fields.filter(
											(_, i) => i !== index
										);
								}}
							/>
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
							<select
								bind:value={field.input.type}
								id={`type_${index}`}
							>
								{#each Object.entries(FieldTypeReadable) as type}
									<option value={type[0]}>{type[1]}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="flex gap1">
						{#if field.input.type === "select"}
							{@const source_id = `source_${index}`}
							<div class="flex column gap1">
								<label for={source_id}>Source</label>
								<select
									bind:value={field.input.source}
									id={source_id}
								>
									<option value="fixed">Static</option>
									<option value="notes">Notes</option>
								</select>
							</div>
							{#if field.input.source === "fixed"}
								{@const options_id = `options_btn_${index}`}
								<FormRow label="Options" id={options_id}>
									<button
										type="button"
										on:click={() => {
											field.input.options =
												field.input.options || [];
											field.input.options = [
												...field.input.options,
												{ label: "", value: "" },
											];
											onChange();
										}}>Add more options</button
									>
								</FormRow>
								<div class="flex column gap1">
									{#each field.input.options || [] as option, idx}
										{@const option_id = `${options_id}_${idx}`}
										<label for={option_id}>Option</label>
										<div class="flex row gap1">
											<input
												type="text"
												placeholder="Label"
												bind:value={option.label}
												id={option_id}
											/>
											<input
												type="text"
												placeholder="Value"
												bind:value={option.value}
												id={option_id}
											/>
											<button
												use:setIcon={"trash"}
												type="button"
												on:click={() => {
													field.input.options =
														field.input.options?.filter(
															(_, i) => i !== idx
														);
													onChange();
												}}
											/>
										</div>
									{/each}
								</div>
							{:else if field.input.source === "notes"}
								<!-- The autocomplete input will be inside the first div, so we remove some styles with the utility classes -->
								<div
									class="flex column gap1 remove-padding remove-border"
									use:folderField={index}
								>
									<label for={source_id}>Source Folder</label>
								</div>
							{/if}
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
						{/if}
					</div>
					<hr />
				{/each}
			</fieldset>
		{:else}
			No fields yet
		{/if}
	</form>
</div>

<style>
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
	.p-2 {
		padding: 0.5rem;
	}
	.hint {
		color: var(--color-base-70);
	}
	@media (min-width: 58rem) {
		.md-row {
			flex-direction: row;
		}
	}
</style>
