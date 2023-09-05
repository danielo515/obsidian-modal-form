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
	/*
	Returns a copy of the data contained on this result.
	*/
	getData() {
		return { ...this.data };
	}
}
