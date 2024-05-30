import { Notice } from "obsidian";

export function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
        () => {
            new Notice("Template has been copied to the clipboard");
        },
        (err) => {
            console.error("Could not copy text: ", err);
        },
    );
}
