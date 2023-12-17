import { objectSelect } from "./objectSelect";
import { stringifyYaml } from "obsidian";

type ResultStatus = "ok" | "cancelled";
export type Val = string | boolean | number | string[];
// We don't use FormData because that is builtin browser API
export type ModalFormData = { [key: string]: Val };

export function isPrimitive(
    value: unknown,
): value is string | boolean | number {
    return (
        typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "number"
    );
}

export function isPrimitiveArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isPrimitive);
}

export default class FormResult {
    constructor(
        private data: ModalFormData,
        public status: ResultStatus,
    ) {}
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
        const data = objectSelect(this.data, options);
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
        const data = objectSelect(this.data, options);
        return Object.entries(data)
            .map(
                ([key, value]) =>
                    `${key}:: ${
                        Array.isArray(value)
                            ? value.map((v) => JSON.stringify(v))
                            : value
                    }`,
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
            result = result.replace(new RegExp(`{{${key}}}`, "g"), value + "");
        }
        return result;
    }
    /**
     * Gets a single value from the data.
     * It takes an optiional mapping function thatt can be used to transform the value.
     * The function will only be called if the value exists.
     * @param {string} key the key to get the value from
     * @param {function} [mapFn] a function to transform the value
     * @returns the value transformed by the function if it was provided, the value or empty string if it doesn't exist
     */
    get(key: string, mapFn?: (value: Val) => Val): Val {
        const value = this.data[key];
        if (value === undefined) {
            return "";
        }
        if (mapFn) {
            return mapFn(value);
        }
        if (typeof value === "object") {
            return JSON.stringify(value);
        }
        return value;
    }
    /* == Aliases ==*/
    /**
     * just an alias for `asFrontmatterString`
     */
    asFrontmatter = this.asFrontmatterString;
    /**
     * just an alias for `asFrontmatterString`
     */
    asYaml = this.asFrontmatterString;
    /**
     * just an alias for `asDataviewProperties`
     */
    asDataview = this.asDataviewProperties;
    /**
     * just an alias for `asDataviewProperties`
     */
    asDv = this.asDataviewProperties;
}
