/**
 * Input types we will auto-focus when a form modal opens.
 * We exclude non-text controls (checkbox, radio, file, range, color…) and
 * buttons because focusing them on open is rarely what the user wants —
 * they expect to start typing in the first text-like field.
 */
const FOCUSABLE_INPUT_TYPES = [
    "text",
    "number",
    "email",
    "tel",
    "search",
    "date",
    "time",
    "datetime-local",
    "url",
    "password",
] as const;

export const INPUT_FOCUS_SELECTOR = [
    ...FOCUSABLE_INPUT_TYPES.map((t) => `input[type="${t}"]:not([disabled])`),
    "textarea:not([disabled])",
    "select:not([disabled])",
].join(", ");

/**
 * Focus the first focusable text-like input inside `root`, if any.
 * Safe to call on a root that contains no matching input.
 */
export function focusFirstInput(root: ParentNode): void {
    const first = root.querySelector<HTMLElement>(INPUT_FOCUS_SELECTOR);
    first?.focus();
}
