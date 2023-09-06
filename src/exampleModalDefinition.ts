import { FormDefinition } from "src/FormModal";

export const exampleModalDefinition: FormDefinition = {
	title: "Example Modal",
	fields: [
		{
			name: "Name",
			description: "It is named how?",
			input: { type: "text" },
		},
		{
			name: "age",
			label: "Age",
			description: "How old",
			input: { type: "number" },
		},
		{
			name: "dateOfBirth",
			label: "Date of Birth",
			description: "When were you born?",
			input: { type: "date" },
		},
		{
			name: "timeOfDay",
			label: "Time of day",
			description: "The time you can do this",
			input: { type: "time" },
		},
		{
			name: "is_family",
			label: "Is family",
			description: "If it is part of the family",
			input: { type: "toggle" },
		},
		{
			name: "reference",
			description: "Reference notes",
			input: { type: "note", folder: "People" },
		},

		{
			name: "best_fried",
			label: "Best friend",
			description: "Pick one",
			input: {
				type: 'select',
				source: 'notes',
				folder: 'People'
			}
		},
		{
			name: "favorite_meal",
			label: "Favorite meal",
			description: "Pick one option",
			input: {
				type: "select", source: "fixed", options: [
					{ value: "pizza", label: "🍕 Pizza" },
					{ value: "pasta", label: "🍝 Pasta" },
					{ value: "burger", label: "🍔 Burger" },
					{ value: "salad", label: "🥗 Salad" },
					{ value: "steak", label: "🥩 Steak" },
					{ value: "sushi", label: "🍣 Sushi" },
					{ value: "ramen", label: "🍜 Ramen" },
					{ value: "tacos", label: "🌮 Tacos" },
					{ value: "fish", label: "🐟 Fish" },
					{ value: "chicken", label: "🍗 Chicken" }
				]
			},
		},


	],
};
