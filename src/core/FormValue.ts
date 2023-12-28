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
export class FormValue {
    constructor(protected value: unknown) {}
    static from(value: unknown) {
        return new FormValue(value);
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
                return this.value.toString();
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
     * Alias for `toBulletList`
     */
    toBullets = this.toBulletList;
}
