<script lang="ts">
    import { App, Component, MarkdownRenderer } from "obsidian";
    import { onDestroy } from "svelte";
    export let app: App;
    export let text: string;
    export let className = "setting-item-description";
    const component = new Component();
    component.load();
    onDestroy(() => component.unload());
    function renderInto(el: HTMLElement, md: string) {
        el.empty();
        if (!md) return;
        MarkdownRenderer.render(app, md, el, "/", component).catch((e) =>
            console.error("Failed to render markdown description", e),
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
