<script lang="ts">
    import { ButtonComponent } from "obsidian";
    const variants: Record<typeof variant, string> = {
        regular: "modal-form-regular",
        danger: "modal-form-danger",
        primary: "modal-form-primary",
    };
    let {
        tooltip,
        icon,
        text,
        variant,
        onClick,
    }: {
        tooltip?: string | undefined;
        icon?: "trash" | "clipboard-copy" | "pencil" | undefined;
        text?: string | undefined;
        variant: "regular" | "danger" | "primary";
        onClick: () => void;
    } = $props();
    let root: HTMLElement;
    $effect(() => {
        const btn = new ButtonComponent(root);
        if (icon) btn.setIcon(icon);
        if (tooltip) btn.setTooltip(tooltip);
        if (text) btn.setButtonText(text);
        btn.onClick(onClick);
        btn.setClass(variants[variant]);
    });
</script>

<span bind:this={root}></span>
