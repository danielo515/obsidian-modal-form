import { FileProxy } from "./files/FileProxy";

export type Val = string | boolean | number | FileProxy | string[];
// We don't use the name "FormData" because that is already taken by a builtin browser API
export type ModalFormData = { [key: string]: Val };

export function isPrimitive(value: unknown): value is string | boolean | number {
    return typeof value === "string" || typeof value === "boolean" || typeof value === "number";
}

export function isPrimitiveArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isPrimitive);
}
