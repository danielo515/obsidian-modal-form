import { stringifyYaml } from "obsidian";

type ResultStatus = "ok" | "cancelled";

export default class FormResult {
	constructor(
		private data: { [key: string]: string },
		public status: ResultStatus
	) {}
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
}
