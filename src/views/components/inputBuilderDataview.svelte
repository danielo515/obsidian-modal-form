<script lang="ts">
	import FormRow from "./FormRow.svelte";

	export let index: number;
	export let value: string;
	$: id = `dataview_${index}`;
</script>

<FormRow label="Dataview Query" {id}>
	<span class="modal-form-hint">
		This is a <a
			href="https://blacksmithgu.github.io/obsidian-dataview/api/intro/"
			>Dataview</a
		>
		query that will be used to populate the input suggestions. You should provide
		a query that returns a list of strings, for example:
		<pre class="language-js"><code
				>dv.pages('#tag').map(p => p.file.name)</code
			></pre>
	</span>
	<textarea
		{id}
		bind:value
		name="dataview_query"
		class="form-control"
		rows="3"
		placeholder="dv.pages('#tag').map(p => p.file.name)"
	/>
</FormRow>

<style>
</style>
