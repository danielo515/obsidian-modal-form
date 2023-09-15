import { stringifyYaml } from "obsidian";

type ResultStatus = "ok" | "cancelled";

// We don't use FormData because that is builtin browser API
export type ModalFormData = { [key: string]: string | boolean | number | string[] };

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
      .map(([key, value]) => `${key}:: ${value}`)
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
