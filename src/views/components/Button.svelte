<script lang="ts">
    import { ButtonComponent, setIcon } from "obsidian";
    import { onMount } from "svelte";

    export let tooltip: string | undefined = undefined;
    export let icon: "trash" | "clipboard-copy" | "pencil" | "eye" | undefined =
        undefined;
    export let text: string | undefined = undefined;
    export let variant: "regular" | "danger" | "primary" = "regular";
    export let onClick: () => void;
    const variants: Record<typeof variant, string> = {
        regular: "modal-form-regular",
        danger: "modal-form-danger",
        primary: "modal-form-primary",
    };
    let root: HTMLElement;
    onMount(() => {
        const btn = new ButtonComponent(root);
        if (icon) btn.setIcon(icon);
        if (tooltip) btn.setTooltip(tooltip);
        if (text) btn.setButtonText(text);
        btn.onClick(onClick);
        btn.setClass(variants[variant]);
    });
</script>

<span bind:this={root}></span>
