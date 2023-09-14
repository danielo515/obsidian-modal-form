<script lang="ts">
	import { MultiSelect } from "src/suggesters/MultiSelect";

	export let selectedVales: string[] = [];
	export let availableOptions: string[] = [];

	function createInput(element){
		new MultiSelect(element, availableOptions, (selected) => {
			selectedVales.push(selected)
		});
	}
</script >

<div >

	<input use:createInput type="text" class="form-control" placeholder="Select" />

	{#each selectedVales as value}
		<div class="badge bg-primary">{value}</div>
	{/each}
</div>
