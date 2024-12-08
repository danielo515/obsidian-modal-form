import { pipe } from "@std";
const moment = window.moment

export interface FilenameTemplate {
    template: string;
}

type PlaceholderFn = () => string;

const placeholders: Record<string, PlaceholderFn> = {
    "{{date}}": () => moment().format("YYYY-MM-DD"),
    "{{time}}": () => moment().format("HH-mm-ss"),
    "{{datetime}}": () => moment().format("YYYY-MM-DD-HH-mm-ss"),
};

/**
 * Replaces placeholders in a template string with their corresponding values
 * @param template The template string containing placeholders
 * @returns A string with all placeholders replaced with their values
 */
export function processTemplate(template: string): string {
    return pipe(
        template,
        (tmpl) =>
            Object.entries(placeholders).reduce(
                (acc, [placeholder, fn]) => acc.replace(placeholder, fn()),
                tmpl
            )
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
 * @returns A valid filename with placeholders replaced
 */
export function createFilename(template: string): string {
    return pipe(
template, 
processTemplate, 
sanitizeFilename);
}
