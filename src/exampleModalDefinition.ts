import type { FormDefinition } from "./core/formDefinition";

export const exampleModalDefinition: FormDefinition = {
    title: "Example form",
    name: "example-form",
    version: "1",
    fields: [
        {
            name: "name",
            label: "Name",
            description: "It is named how?",
            isRequired: true,
            input: { type: "text" },
        },
        {
            name: "age",
            label: "Age",
            description: "How old",
            isRequired: true,
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
            name: "favorite_book",
            label: "Favorite book",
            description: "Pick one",
            input: { type: "note", folder: "Books" },
        },
        {
            name: "folder",
            label: "The destination folder",
            description: "It offers auto-completion to existing folders",
            input: { type: "folder" },
        },
        {
            name: "multi_example",
            label: "Multi select folder",
            description: "Allows to pick many notes from a folder",
            input: { type: "multiselect", source: "notes", folder: "Books" },
        },
        {
            name: "multi_example_2",
            label: "Multi select fixed",
            description: "Allows to pick many notes from a fixed list",
            input: {
                type: "multiselect",
                source: "fixed",
                allowUnknownValues: false,
                multi_select_options: [
                    "Android",
                    "iOS",
                    "Windows",
                    "MacOS",
                    "Linux",
                    "Solaris",
                    "MS2",
                ],
            },
        },
        {
            name: "multi_select_dataview",
            label: "Multi select dataview",
            description: "Allows to pick several values from a dv query",
            input: {
                type: "multiselect",
                source: "dataview",
                query: 'dv.pages("#person").map(p => p.file.name)',
                allowUnknownValues: true,
            },
        },
        {
            name: "best_fried",
            label: "Best friend",
            description: "Select of type note from a folder",
            input: {
                type: "select",
                source: "notes",
                folder: "People",
            },
        },
        {
            name: "dataview_example",
            label: "Dataview example",
            description: "Only people matching the dataview query will be shown",
            input: {
                type: "dataview",
                query: 'dv.pages("#person").filter(p => p.age < 30).map(p => p.file.name)',
            },
        },
        {
            name: "friendship_level",
            label: "Friendship level",
            description: "How good friends are you?",
            input: {
                type: "slider",
                min: 0,
                max: 10,
            },
        },
        {
            name: "favorite_meal",
            label: "Favorite meal",
            description: "Pick one option",
            input: {
                type: "select",
                source: "fixed",
                options: [
                    { value: "pizza", label: "🍕 Pizza" },
                    { value: "pasta", label: "🍝 Pasta" },
                    { value: "burger", label: "🍔 Burger" },
                    { value: "salad", label: "🥗 Salad" },
                    { value: "steak", label: "🥩 Steak" },
                    { value: "sushi", label: "🍣 Sushi" },
                    { value: "ramen", label: "🍜 Ramen" },
                    { value: "tacos", label: "🌮 Tacos" },
                    { value: "fish", label: "🐟 Fish" },
                    { value: "chicken", label: "🍗 Chicken" },
                ],
            },
        },
        {
            name: "some notes",
            label: "Multi line notes",
            description: "Put your thouhts here",
            input: {
                type: "textarea",
            },
        },
        {
            name: "Tags",
            description: "Tags input example",
            input: { type: "tag" },
        },
        {
            name: "document",
            description: "Document block example",
            input: {
                type: "document_block",
                body: "return `Hello ${form.name}!<br> Your best friend is <b>${form.best_fried}</b>`",
            },
        },
    ],
};
