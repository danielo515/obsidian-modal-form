import { FormDefinition } from "src/FormModal";

export const exampleModalDefinition: FormDefinition = {
	title: "Example Modal",
	fields: [
		// example of how name will be used as label if label is missing.
		{
			name: "Name",
			description: "It is named how?",
			type: "text",
		},
		{
			name: "age",
			label: "Age",
			description: "How old",
			type: "number",
		},
		{
			name: "dateOfBirth",
			label: "Date of Birth",
			description: "When were you born?",
			type: "date",
		},
		{
			name: "timeOfDay",
			label: "Time of day",
			description: "The time you can do this",
			type: "time",
		},
		{
			name: "likes_sex",
			label: "Likes sex",
			description: "If likes to have sex",
			type: "toggle",
		},
		{
			name: "reference",
			description: "Reference notes",
			type: "note",
		},
	],
};
