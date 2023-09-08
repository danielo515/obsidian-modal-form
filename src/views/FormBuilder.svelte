<script lang="ts">
	import type { FormDefinition } from "src/FormModal";
	import { FieldTypeReadable } from "src/EditFormView";

	export let definition: FormDefinition = { title: "", name: "", fields: [] };
	[];
	const handleSubmit = () => {
		console.log(definition);
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
								name: "text",
								label: "",
								description: "",
								input: { type: "text" },
							},
						];
					}}>Add more fields</button
				>
				<button type="submit">Save</button>
			</div>
		</fieldset>

		<h3>Fields</h3>
		{#if definition.fields.length > 0}
			<fieldset class="flex column gap2">
				{#each definition.fields as field, index}
					{@const desc_id = `desc_${index}`}
					<div class="flex row gap2">
						<div class="flex column gap1">
							<label for={`label_${index}`}>Name</label>
							<input
								type="text"
								placeholder="Label"
								bind:value={field.label}
								id={`label_${index}`}
							/>
						</div>
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
							<label for={`type_${index}`}>Name</label>
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
	.hint {
		color: var(--color-base-70);
	}
</style>
