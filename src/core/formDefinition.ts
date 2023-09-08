/**
 * Here are the core logic around the main domain of the plugin,
 * which is the form definition.
 * Here are the types, validators, rules etc.
 */

export type FieldType =
	| "text"
	| "number"
	| "date"
	| "time"
	| "datetime"
	| "toggle";

type selectFromNotes = { type: "select"; source: "notes", folder: string };
type inputType =
	| { type: FieldType }
	| { type: "note"; folder: string }
	| { type: "slider"; min: number, max: number }
	| selectFromNotes
	| {
		type: "select";
		source: "fixed";
		options: { value: string; label: string }[];
	};
export function isSelectFromNotes(input: inputType): input is selectFromNotes {
	return input.type === "select" && input.source === "notes";
}

export type AllFieldTypes = FieldType | "note" | "slider" | "select";
/**
 * FormDefinition is an already valid form, ready to be used in the form modal.
 * @param title - The title of the form which will appear as H1 heading in the form modal.
 * @param fields - An array of field objects, each representing a field in the form.
 * Each field object has the following properties:
 * @param name - The name of the field. This will be the key name in the resulting data returned
 * @param label - optional label to show in the UI. If it does not exist, the name will be used.
 * @param description - A description of the field.
 * @param type - The type of the field. Can be one of "text", "number", "date", "time", "datetime", "toggle".
 */
export type FormDefinition = {
	title: string;
	name: string;
	fields: {
		name: string;
		label?: string;
		description: string;
		input: inputType;
	}[];
};
