import { parse, pipe } from "@std";
import * as E from "fp-ts/Either";
import { ValiError, BaseSchema } from "valibot";
import { AllFieldTypes } from "./formDefinition";
import { FieldMinimal, InputTypeToParserMap, FieldMinimalSchema } from "./formDefinitionSchema";


export class InvalidInputTypeError {
    static readonly _tag = "InvalidInputTypeError" as const;
    constructor(public input: unknown) { }
    toString(): string {
        return `InvalidInputTypeError: ${JSON.stringify(this.input)}`;
    }
}

export class InvalidInputError {
    static readonly _tag = "InvalidInputError" as const;
    constructor(public input: FieldMinimal, readonly error: ValiError) { }
    toString(): string {
        return `InvalidInputError: ${this.error.issues.map((issue) => issue.message).join(', ')}`;
    }
}
function isValidInputType(input: unknown): input is AllFieldTypes {
    return 'string' === typeof input && input in InputTypeToParserMap;
}
/**
 * Finds the corresponding schema to the provided unparsed field.
 * It uses the most basic schema to parse the field because we only need
 * the input type to find the corresponding schema.
 * This is function is usually needed when you know that the field parsing has failed,
 * but you need the right input schema to get the specific error.
 * This is again due to a limitation of valibot.
 * @param fieldDefinition a field definition to find the input schema for
 * @returns a tuple of the basic field definition and the input schema
 */
export function findInputDefinitionSchema(fieldDefinition: unknown): E.Either<ValiError | InvalidInputTypeError, [FieldMinimal, BaseSchema]> {
    return pipe(
        parse(FieldMinimalSchema, fieldDefinition),
        E.chainW((field) => {
            const type = field.input.type;
            if (isValidInputType(type)) return E.right([field, InputTypeToParserMap[type]]);
            else return E.left(new InvalidInputTypeError(type));
        })
    );
}
