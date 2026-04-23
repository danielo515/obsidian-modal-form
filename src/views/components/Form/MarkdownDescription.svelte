<script lang="ts">
    import { App, Component, MarkdownRenderer } from "obsidian";
    import { onDestroy } from "svelte";
    export let app: App;
    export let text: string;
    export let className = "setting-item-description";
    const component = new Component();
    component.load();
    onDestroy(() => component.unload());
    function render(el: HTMLElement, currentText: string) {
        el.empty();
        if (currentText) MarkdownRenderer.render(app, currentText, el, "/", component);
        return {
            update(newText: string) {
                el.empty();
                if (newText) MarkdownRenderer.render(app, newText, el, "/", component);
            },
        };
    }
</script>

<div class={className} use:render={text}></div>
