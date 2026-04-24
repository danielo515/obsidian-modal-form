<script lang="ts">
    import { App, Component, MarkdownRenderer } from "obsidian";
    import { onDestroy } from "svelte";
    export let app: App;
    export let text: string;
    export let className = "setting-item-description";
    const component = new Component();
    component.load();
    onDestroy(() => component.unload());
    function showRenderError(el: HTMLElement, err: unknown) {
        el.empty();
        console.error("Failed to render markdown description", err);
        const msg = err instanceof Error ? err.message : String(err);
        el.createDiv({
            cls: "modal-form-description-error",
            text: `Failed to render description: ${msg}`,
        });
    }
    function renderInto(el: HTMLElement, md: string) {
        el.empty();
        if (!md) return;
        MarkdownRenderer.render(app, md, el, "/", component).catch((e) =>
            showRenderError(el, e),
        );
    }
    function render(el: HTMLElement, currentText: string) {
        renderInto(el, currentText);
        return {
            update(newText: string) {
                renderInto(el, newText);
            },
        };
    }
</script>

<div class={className} use:render={text}></div>
