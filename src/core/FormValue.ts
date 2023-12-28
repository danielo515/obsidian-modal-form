import { E, O, ensureError, pipe } from "@std";
import { notifyError } from "src/utils/Log";

function _toBulletList(value: Record<string, unknown> | unknown[]) {
    if (Array.isArray(value)) {
        return value.map((v) => `- ${v}`).join("\n");
    }
    return Object.entries(value)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n");
}
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * class representing a single form value.
 * It is usually returned when you call `result.getValue(name)`.
 * It has some convenience methods to render the value in a way
 * that works well with templates.
 */
export class FormValue<T = unknown> {
    constructor(
        protected value: T,
        protected name: string,
    ) {}
    static from<U = unknown>(value: U, name: string) {
        return new FormValue(value, name);
    }
    /**
     * Returns the value as a string.
     * If the value is an array, it will be joined with a comma.
     * If the value is an object, it will be stringified.
     * This is convenient because it is the default method called auotmatically
     * when the value needs to be rendered as a string, so you can just drop
     * the value directly into a template without having to call this method.
     * @returns string
     */
    toString() {
        switch (typeof this.value) {
            case "string":
                return this.value;
            case "number":
            case "boolean":
                return this.value.toString();
            case "object":
                if (Array.isArray(this.value)) {
                    return this.value.join(", ");
                }
                return JSON.stringify(this.value);
            default:
                return "";
        }
    }
    /**
     * Returns the value as a bullet list.
     * If the value is empty or undefined, it will return an empty string.
     * If the value is a single value, it will return as a single item bullet list.
     * If the value is an array, it will return a bullet list with each item in the array.
     * If the value is an object, it will return a bullet list with each key/value pair in the object.
     * @returns string
     */
    toBulletList() {
        switch (typeof this.value) {
            case "boolean":
            case "number":
            case "string":
                return `- ${this.value}`;
            case "object": {
                const value = this.value;
                if (Array.isArray(value)) {
                    return _toBulletList(value);
                }
                if (isRecord(value)) {
                    return _toBulletList(value);
                }
                return `- ${JSON.stringify(value)}`;
            }

            default:
                return "";
        }
    }
    /**
     * Converts the value to a dataview property using the field name as the key.
     * If the value is empty or undefined, it will return an empty string and not render anything.
     */
    toDataview() {
        const value = this.value;
        if (value === undefined) return "";
        if (Array.isArray(value)) {
            return `[${this.name}:: ${JSON.stringify(value).slice(1, -1)}]`;
        }
        return `[${this.name}:: ${this.toString()}]`;
    }
    /**
     * Transforms the containerd value using the provided function.
     * If the value is undefined or null the function will not be called
     * and the result will be the same as the original.
     * This is useful if you want to apply somme modifications to the value
     * before rendering it, for example if none of the existing format methods suit your needs.
     * @param {function} fn the function to transform the values
     * @returns a new FormValue with the transformed value
     **/
    map<U>(fn: (value: unknown) => U): FormValue<T | U> {
        const safeFn = E.tryCatchK(fn, ensureError);
        const unchanged = () => this as FormValue<T | U>;
        return pipe(
            this.value,
            O.fromNullable,
            O.map(safeFn),
            O.fold(unchanged, (v) =>
                pipe(
                    v,
                    E.fold(
                        (e) => {
                            notifyError("Error in map of " + this.name)(e.message);
                            return unchanged();
                        },

                        (v: U) => FormValue.from(v, this.name),
                    ),
                ),
            ),
        );
    }
    /** Alias for `toDataview` */
    toDv = this.toDataview;
    /** Alias for `toBulletList` */
    toBullets = this.toBulletList;
    /**
     * Convenient getter to get the value as bullets, so you don't need to call `toBulletList` manually.
     * example:
     * ```ts
     *  result.getValue("myField").bullets;
     * ```
     */
    get bullets() {
        return this.toBulletList();
    }
}
