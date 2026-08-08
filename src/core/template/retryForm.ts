import { FormDefinition } from "../formDefinition";

export const retryForm: FormDefinition = {
    title: "Fix the template",
    name: "retry-temlate",
    version: "1",
    fields: [
        {
            name: "title",
            label: "",
            description: "",
            input: {
                type: "markdown_block",
                body: "return `\n==The template could not be processed==\n\n${form.title ?? ''}\n\nFix the template below and submit it to try again.\n`",
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
