import FormResult from "../FormResult";

/**
 * This is a dummy declare so we can use the FormResult
 * in the dummy functions used to generate the template strings
 * in a type-safe way.
 */
declare const result: FormResult;

// eslint-disable-next-line @typescript-eslint/ban-types
function getFunctionBody(fn: Function) {
    return fn
        .toString()
        .replace(/^[^{]*{/, "")
        .replace(/}[^}]*$/, "")
        .trim();
}

/**
 * This is just a dummy function to get type-checking
 * in the template strings we are generating.
 */
// prettier-ignore
function get_value() {
    result.get("__key__")
}

export function buildResultBody(
    fields: string[],
    template: string,
    options: { resultName: string },
) {
    const getTemplate = getFunctionBody(get_value)
        .replace(/result/, options.resultName)
        .replace(/;$/, ""); //stupid automatic semicolon insertion
    console.log({ getTemplate });
    return fields.reduce((template, field) => {
        return template.replace(
            new RegExp(`{{${field}}}`, "g"),
            `<% ${getTemplate.replace(/__key__/, field)} %>`,
        );
    }, template);
}
