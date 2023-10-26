import { stringifyYaml } from "obsidian";
import { log_error } from "../utils/Log";
import { ModalFormError } from "../utils/Error";
import { object, optional, array, string, coerce } from "valibot";
import { parse } from "@std";

type ResultStatus = "ok" | "cancelled";

// We don't use FormData because that is builtin browser API
export type ModalFormData = { [key: string]: string | boolean | number | string[] };

function isPrimitive(value: unknown): value is string | boolean | number {
    return typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number';
}

function isPrimitiveArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isPrimitive)
}

const KeysSchema = array(coerce(string(), String))

const PickOmitSchema = object({
    pick: optional(KeysSchema),
    omit: optional(KeysSchema),
});

console.log(parse(PickOmitSchema, { pick: ['a', 'b'] }))
console.log(parse(PickOmitSchema, { pick: [11], omit: ['a', 'b'] }))
console.log(parse(PickOmitSchema, undefined))

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
    asFrontmatterString() {
        return stringifyYaml(this.data);
    }
    /**
     * Return the current data as a block of dataview properties
     * @returns string
     */
    asDataviewProperties(): string {
        return Object.entries(this.data)
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
