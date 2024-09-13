<script lang="ts">
    import { setIcon, setTooltip } from "obsidian";
    export let label: string;
    export let id: string;
    export let hideLabel = false;
    export let inline = false;
    export let tooltip: string | undefined = undefined;
    function addTooltip(el: HTMLElement) {
        if (tooltip) {
            setTooltip(el, tooltip);
            setIcon(el, "help");
        }
    }
</script>

<div class="field-group" class:inline>
    <div>
        <label for={id} class:hidden-label={hideLabel}>{label}</label>
        {#if tooltip}
            <span use:addTooltip />
        {/if}
    </div>
    <slot />
</div>

<style>
    .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .inline {
        flex-direction: row;
        align-items: center;
        gap: 1rem;
    }
    .hidden-label {
        white-space: nowrap;
        overflow: hidden;
        visibility: hidden;
    }
</style>
