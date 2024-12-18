import { FormDefinition } from "../formDefinition";

export const retryForm: FormDefinition = {
    title: "Templater error",
    name: "retry-temlate",
    version: "1",
    fields: [
        {
            name: "title",
            label: "",
            description: "",
            input: {
                type: "markdown_block",
                body: "return `\n==Templater reported an error==\nWe are not sure about what it is, but is very likely a parse error.\nPlease try to fix the templater code below and submit it to retry\n`",
            },
            isRequired: false,
        },
        {
            name: "template",
            label: "Code",
            description: "Fix the template below and try to submit again",
            input: {
                type: "textarea",
                hidden: false,
            },
            isRequired: false,
        },
    ],
};
