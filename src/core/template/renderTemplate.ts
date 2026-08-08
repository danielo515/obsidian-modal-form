import { E } from "@std";
import type { ModalFormData } from "../formResultTypes";
import { TemplateError } from "./TemplateError";
import { executeTemplate, type ParsedTemplate } from "./templateParser";

/**
 * Same as `executeTemplate`, but a broken template produces a `TemplateError`
 * instead of blowing up the whole flow and taking the user data with it.
 */
export function renderTemplate(
    parsedTemplate: ParsedTemplate,
    formData: ModalFormData,
): E.Either<TemplateError, string> {
    return E.tryCatch(
        () => executeTemplate(parsedTemplate, formData),
        TemplateError.of("The form template could not be rendered"),
    );
}

/**
 * Turns whatever a template service threw at us into something a user can act
 * on. Template failures are usually wrapped errors, and the useful part (the
 * Templater parse error, the file system error) lives in the cause.
 */
export function describeTemplateError(error: unknown): string {
    const seen = new Set<unknown>();
    const messages: string[] = [];
    let current: unknown = error;
    while (current !== undefined && current !== null && !seen.has(current)) {
        seen.add(current);
        if (current instanceof Error) {
            if (current.message && !messages.includes(current.message)) {
                messages.push(current.message);
            }
            // `cause` is ES2022, which is newer than the lib we target
            current = (current as Error & { cause?: unknown }).cause;
        } else if (typeof current === "string") {
            if (current && !messages.includes(current)) messages.push(current);
            current = undefined;
        } else {
            const asString = String(current);
            if (asString !== "[object Object]" && !messages.includes(asString)) {
                messages.push(asString);
            }
            current = undefined;
        }
    }
    return messages.length > 0 ? messages.join(": ") : "Unknown error";
}
