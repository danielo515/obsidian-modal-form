<script lang="ts">
	export let label: string;
	export let id: string;
</script>

<div class="field-goup">
	<label for={id}>{label}</label>
	<slot />
</div>

<style>
	.field-goup {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
