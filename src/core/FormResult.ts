import { stringifyYaml } from "obsidian";
import { ResultValue } from "./ResultValue";
import { FileProxy } from "./files/FileProxy";
import { objectSelect } from "./objectSelect";

type ResultStatus = "ok" | "cancelled";
export type Val = string | boolean | number | FileProxy | string[];
// We don't use the name "FormData" because that is already take by a builtin browser API
export type ModalFormData = { [key: string]: Val };

export function isPrimitive(value: unknown): value is string | boolean | number {
    return typeof value === "string" || typeof value === "boolean" || typeof value === "number";
}

export function isPrimitiveArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isPrimitive);
}

export default class FormResult {
    private constructor(
        private data: ModalFormData,
        public status: ResultStatus,
    ) {}

    static make(data: ModalFormData, status: ResultStatus) {
        return new Proxy(new FormResult(data, status), {
            get(target, key, receiver) {
                // Forward everything that is an own property or not a string key
                if (key in target || typeof key !== "string") {
                    return Reflect.get(target, key, receiver);
                }
                // Any other access, will be forwarded to the getValue and wrapped in a ResultValue
                return target.getValue(key);
            },
        });
    }
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
                        Array.isArray(value) ? value.map((v) => JSON.stringify(v)) : value
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
    getValue(key: string): ResultValue {
        return ResultValue.from(this.data[key], key);
    }
    // alias
    getV = this.getValue;
    /* == Aliases ==*/
    /** just an alias for `asFrontmatterString` */
    asFrontmatter = this.asFrontmatterString;
    /** just an alias for `asFrontmatterString` */
    asYaml = this.asFrontmatterString;
    /** just an alias for `asDataviewProperties` */
    asDataview = this.asDataviewProperties;
    /** just an alias for `asDataviewProperties` */
    asDv = this.asDataviewProperties;
}
