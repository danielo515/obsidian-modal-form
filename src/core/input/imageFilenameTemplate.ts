import { pipe } from "@std";
import { FileProxy } from "../files/FileProxy";
import type { ModalFormData, Val } from "../formResultTypes";

export interface FilenameTemplate {
    template: string;
}

/** Matches `{{ placeholder }}`, tolerating any amount of surrounding whitespace */
const PLACEHOLDER_RE = /\{\{\s*([^{}]*?)\s*\}\}/g;

/** Separator used to flatten multi valued fields (multiselect, tags) into a filename */
const LIST_SEPARATOR = "-";

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

const formatDate = (now: Date) =>
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const formatTime = (now: Date) =>
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const formatDatetime = (now: Date) => `${formatDate(now)}-${formatTime(now)}`;

/**
 * Placeholders that are always available, regardless of the form contents.
 * They take precedence over form fields to avoid breaking existing templates.
 */
const datePlaceholders = {
    date: formatDate,
    time: formatTime,
    datetime: formatDatetime,
} satisfies Record<string, (now: Date) => string>;

/** Own property check, so inherited names like `__proto__` or `toString` are not mistaken for keys */
function hasOwn(object: object, name: string): boolean {
    return Object.prototype.hasOwnProperty.call(object, name);
}

function isDatePlaceholder(name: string): name is keyof typeof datePlaceholders {
    return hasOwn(datePlaceholders, name);
}

/**
 * Renders a form value as a filename friendly string.
 * Lists are joined with a dash, files are represented by their name without extension.
 */
function valueToString(value: Val): string {
    if (Array.isArray(value)) return value.map(String).join(LIST_SEPARATOR);
    if (value instanceof FileProxy) return value.basename;
    return String(value);
}

/**
 * Replaces placeholders in a template string with their corresponding values.
 * Besides the built-in date placeholders, any field of the form can be referenced
 * by name, so a template like `{{ name }} - new member` renders using the value
 * the user typed on the `name` field.
 * @param template The template string containing placeholders
 * @param values The current form values, used to resolve field placeholders
 * @param now The date used to resolve the date placeholders. Defaults to the current time
 * @returns A string with all placeholders replaced with their values
 */
export function processTemplate(
    template: string,
    values: ModalFormData = {},
    now: Date = new Date(),
): string {
    return template.replace(PLACEHOLDER_RE, (_match, rawName: string) => {
        const name = rawName.trim();
        if (isDatePlaceholder(name)) return datePlaceholders[name](now);
        if (!hasOwn(values, name)) return "";
        const value = values[name];
        return value === undefined ? "" : valueToString(value);
    });
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
 * Creates a filename from a template, replacing placeholders and sanitizing the result.
 * When the resulting filename is empty, because every placeholder resolved to an empty
 * value, a datetime based filename is used instead, so we never save an extension-only file.
 * @param template The template containing placeholders
 * @param values The current form values, used to resolve field placeholders
 * @param now The date used to resolve the date placeholders. Defaults to the current time
 * @returns A valid filename with placeholders replaced
 */
export function createFilename(
    template: string,
    values: ModalFormData = {},
    now: Date = new Date(),
): string {
    return pipe(
        processTemplate(template, values, now),
        sanitizeFilename,
        (filename) => filename.trim(),
        (filename) => (filename === "" ? formatDatetime(now) : filename),
    );
}
