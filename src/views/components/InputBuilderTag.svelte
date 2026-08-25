<script lang="ts">
    import FormRow from "./FormRow.svelte";

    export let index: number;
    export let include: string | undefined;
    export let exclude: string | undefined;
    export let notifyChange: () => void;

    $: includeId = `tag_include_${index}`;
    $: excludeId = `tag_exclude_${index}`;
    $: includeError = checkRegex(include);
    $: excludeError = checkRegex(exclude);

    function checkRegex(pattern: string | undefined): string {
        if (!pattern) return "";
        try {
            new RegExp(pattern);
            return "";
        } catch (e) {
            return e instanceof Error ? e.message : "Invalid regex";
        }
    }

    function onIncludeChange(e: Event) {
        const v = (e.target as HTMLInputElement).value;
        include = v.trim() || undefined;
        notifyChange();
    }

    function onExcludeChange(e: Event) {
        const v = (e.target as HTMLInputElement).value;
        exclude = v.trim() || undefined;
        notifyChange();
    }
</script>

<div class="flex column gap1 full-width">
    <FormRow
        label="Include pattern"
        id={includeId}
        tooltip="Regular expression. If set, only tags matching this pattern will be suggested. Example: ^Setting/ only allows tags starting with 'Setting/'."
    >
        <input
            id={includeId}
            type="text"
            value={include ?? ""}
            on:input={onIncludeChange}
            placeholder="^Setting/"
        />
        {#if includeError}
            <div class="modal-form-error-message">{includeError}</div>
        {/if}
    </FormRow>
    <FormRow
        label="Exclude pattern"
        id={excludeId}
        tooltip="Regular expression. If set, tags matching this pattern will be hidden from suggestions."
    >
        <input
            id={excludeId}
            type="text"
            value={exclude ?? ""}
            on:input={onExcludeChange}
            placeholder="^archive/"
        />
        {#if excludeError}
            <div class="modal-form-error-message">{excludeError}</div>
        {/if}
    </FormRow>
</div>

<style>
    .full-width {
        width: 100%;
    }
</style>
