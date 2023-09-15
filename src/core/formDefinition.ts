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
type inputSlider = { type: "slider"; min: number, max: number };
type inputNoteFromFolder = { type: "note"; folder: string };
type inputDataviewSource = { type: 'dataview', query: string };
type inputSelectFixed = {
	type: "select";
	source: "fixed";
	options: { value: string; label: string }[];
}
type basicInput = { type: FieldType };
type multiselect = { type: 'multiselect', source: 'notes', folder: string } | { type: 'multiselect', source: 'fixed', options: string[] }
type inputType =
	| basicInput
	| inputNoteFromFolder
	| inputSlider
	| selectFromNotes
	| inputDataviewSource
	| multiselect
	| inputSelectFixed;

export const FieldTypeReadable: Record<AllFieldTypes, string> = {
	"text": "Text",
	"number": "Number",
	"date": "Date",
	"time": "Time",
	"datetime": "DateTime",
	"toggle": "Toggle",
	"note": "Note",
	"slider": "Slider",
	"select": "Select",
	"dataview": "Dataview",
	"multiselect": "Multiselect",
} as const;

function isObject(input: unknown): input is Record<string, unknown> {
	return typeof input === "object" && input !== null;
}
export function isDataViewSource(input: unknown): input is inputDataviewSource {
	return isObject(input) && input.type === 'dataview' && typeof input.query === 'string';
}

export function isInputSlider(input: unknown): input is inputSlider {
	if (!isObject(input)) {
		return false;
	}
	if ('min' in input && 'max' in input && typeof input.min === 'number' && typeof input.max === 'number' && input.type === 'slider') {
		return true;
	}
	return false
}
export function isSelectFromNotes(input: unknown): input is selectFromNotes {
	if (!isObject(input)) {
		return false;
	}
	return input.type === "select" && input.source === "notes" && typeof input.folder === "string";
}

export function isInputNoteFromFolder(input: unknown): input is inputNoteFromFolder {
	if (!isObject(input)) {
		return false;
	}
	return input.type === "note" && typeof input.folder === "string";
}
export function isInputSelectFixed(input: unknown): input is inputSelectFixed {
	if (!isObject(input)) {
		return false;
	}
	return input.type === "select" && input.source === "fixed" && Array.isArray(input.options) && input.options.every((option: unknown) => {
		return isObject(option) && typeof option.value === "string" && typeof option.label === "string";
	})
}

export type AllFieldTypes = inputType['type']
export type FieldDefinition = {
	name: string;
	label?: string;
	description: string;
	input: inputType;
}
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
	fields: FieldDefinition[];
};

// When an input is in edit state, it is represented by this type.
// It has all the possible values, and then you need to narrow it down
// to the actual type.
export type EditableInput = {
	type: AllFieldTypes;
	source?: "notes" | "fixed";
	folder?: string;
	min?: number;
	max?: number;
	options?: { value: string; label: string }[];
	query?: string;
};

export type EditableFormDefinition = {
	title: string;
	name: string;
	fields: {
		name: string;
		label?: string;
		description: string;
		input: EditableInput;
	}[];
};

export function isValidBasicInput(input: unknown): input is basicInput {
	if (!isObject(input)) {
		return false;
	}
	return ["text", "number", "date", "time", "datetime", "toggle"].includes(input.type as string);
}

export function isMultiSelect(input: unknown): input is multiselect {
	return isObject(input)
		&& input.type === 'multiselect'
		&& (
			(input.source === 'notes' && typeof input.folder === 'string') || (input.source === 'fixed' && Array.isArray(input.options))
		)
}

export function isInputTypeValid(input: unknown): input is inputType {
	switch (true) {
		case isValidBasicInput(input):
		case isInputNoteFromFolder(input):
		case isInputSlider(input):
		case isSelectFromNotes(input):
		case isInputSelectFixed(input):
		case isDataViewSource(input):
		case isMultiSelect(input):
			return true;
		default:
			return false;

	}
}


export function decodeInputType(input: EditableInput): inputType | null {
	if (isInputSlider(input)) {
		return { type: "slider", min: input.min, max: input.max };
	} else if (isSelectFromNotes(input)) {
		return { type: "select", source: "notes", folder: input.folder };
	} else if (isInputNoteFromFolder(input)) {
		return { type: "note", folder: input.folder! };
	} else if (isInputSelectFixed(input)) {
		return { type: "select", source: "fixed", options: input.options };
	} else if (isValidBasicInput(input)) {
		return { type: input.type };
	} else {
		return null;
	}
}

export function isFieldValid(input: unknown): input is FieldDefinition {
	if (!isObject(input)) {
		return false;
	}
	if (typeof input.name !== "string" || input.name.length === 0) {
		return false;
	}
	if (typeof input.description !== "string") {
		return false;
	}
	if (input.label !== undefined && typeof input.label !== "string") {
		return false;
	}
	console.log('basic input fields are valid')
	return isInputTypeValid(input.input);
}

export function isValidFormDefinition(input: unknown): input is FormDefinition {
	if (!isObject(input)) {
		return false;
	}
	if (typeof input.title !== "string") {
		return false;
	}
	if (typeof input.name !== "string" || input.name === '') {
		return false;
	}
	console.log('basic is valid');
	return Array.isArray(input.fields) && input.fields.every(isFieldValid);
}
