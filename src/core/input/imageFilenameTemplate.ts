export interface FilenameTemplate {
    template: string;
}

export interface FilenameContext {
    /** Original file basename without extension. Falls back to "image" when unknown. */
    originalName?: string;
}

type PlaceholderFn = (ctx: FilenameContext) => string;

const placeholders: Record<string, PlaceholderFn> = {
    "{{date}}": () => window.moment().format("YYYY-MM-DD"),
    "{{time}}": () => window.moment().format("HH-mm-ss"),
    "{{datetime}}": () => window.moment().format("YYYY-MM-DD-HH-mm-ss"),
    "{{filename}}": (ctx) => stripExtension(ctx.originalName ?? "image"),
};

function stripExtension(name: string): string {
    const lastDot = name.lastIndexOf(".");
    return lastDot > 0 ? name.slice(0, lastDot) : name;
}

/**
 * Replaces placeholders in a template string with their corresponding values
 * @param template The template string containing placeholders
 * @param ctx Optional context (e.g. original filename) used to expand placeholders
 * @returns A string with all placeholders replaced with their values
 */
export function processTemplate(template: string, ctx: FilenameContext = {}): string {
    return Object.entries(placeholders).reduce(
        (acc, [placeholder, fn]) => acc.split(placeholder).join(fn(ctx)),
        template,
    );
}

/**
 * Sanitizes a filename by removing invalid characters
 * @param filename The filename to sanitize
 * @returns A sanitized filename
 */
export function sanitizeFilename(filename: string): string {
    return filename.replace(/[<>:"/\\|?*]/g, "-");
}

/**
 * Creates a filename from a template, replacing placeholders and sanitizing the result
 * @param template The template containing placeholders
 * @param ctx Optional context (e.g. original filename) used to expand placeholders
 * @returns A valid filename with placeholders replaced
 */
export function createFilename(template: string, ctx: FilenameContext = {}): string {
    return sanitizeFilename(processTemplate(template, ctx));
}
