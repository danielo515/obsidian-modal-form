<script lang="ts">
	export let label: string;
	export let id: string;
	export let hideLabel = false;
</script>

<div class="field-goup">
	<label for={id} class:hidden-label={hideLabel}>{label}</label>
	<slot />
</div>

<style>
	.field-goup {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.hidden-label {
		white-space: nowrap;
		overflow: hidden;
		visibility: hidden;
	}
</style>
