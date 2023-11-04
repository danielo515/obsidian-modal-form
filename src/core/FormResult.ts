import { objectSelect } from './objectSelect';
import { stringifyYaml } from "obsidian";
import { log_error } from "../utils/Log";
import { ModalFormError } from "../utils/ModalFormError";

type ResultStatus = "ok" | "cancelled";

// We don't use FormData because that is builtin browser API
export type ModalFormData = { [key: string]: string | boolean | number | string[] };

function isPrimitive(value: unknown): value is string | boolean | number {
    return typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number';
}

function isPrimitiveArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isPrimitive)
}


export function formDataFromFormOptions(values: Record<string, unknown>) {
    const result: ModalFormData = {};
    const invalidKeys = []
    for (const [key, value] of Object.entries(values)) {
        if (Array.isArray(value) && isPrimitiveArray(value)) {
            result[key] = value;
        } else if (isPrimitive(value)) {
            result[key] = value;
        } else {
            invalidKeys.push(key)
        }
    }
    if (invalidKeys.length > 0) {
        log_error(new ModalFormError(`Invalid keys in form options: ${invalidKeys.join(', ')}`))
    }
    return result;
}

export default class FormResult {
    constructor(private data: ModalFormData, public status: ResultStatus) { }
    /**
     * Transform  the current data into a frontmatter string, which is expected
     * to be enclosed in `---` when used in a markdown file.
     * This method does not add the enclosing `---` to the string, 
     * so you can put it anywhere inside the frontmatter.
     * @param {Object} [options] an options object describing what options to pick or omit
     * @param {string[]} [options.pick] an array of key names to pick from the data
     * @param {string[]} [options.omit] an array of key names to omit from the data
     * @returns the data formatted as a frontmatter string
     */
    asFrontmatterString(options?: unknown) {
        const data = objectSelect(this.data, options)
        return stringifyYaml(data);
    }
    /**
     * Return the current data as a block of dataview properties
     * @param {Object} [options] an options object describing what options to pick or omit
     * @param {string[]} [options.pick] an array of key names to pick from the data
     * @param {string[]} [options.omit] an array of key names to omit from the data
     * @returns string
     */
    asDataviewProperties(options?: unknown): string {
        const data = objectSelect(this.data, options)
        return Object.entries(data)
            .map(([key, value]) =>
                `${key}:: ${Array.isArray(value) ? value.map((v) => JSON.stringify(v)) : value}`
            )
            .join("\n");
    }
    /**
    Returns a copy of the data contained on this result.
    */
    getData() {
        return { ...this.data };
    }
    /**
     * Returns the data formatted as a string matching the provided
     * template.
     */
    asString(template: string): string {
        let result = template;
        for (const [key, value] of Object.entries(this.data)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value + "");
        }
        return result;
    }
}
