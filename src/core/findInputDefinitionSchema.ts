import { A, NonEmptyArray, ParsingFn, parse, pipe } from "@std";
import * as E from "fp-ts/Either";
import { ValiError, BaseSchema } from "valibot";
import { FieldMinimal, FieldMinimalSchema } from "./formDefinitionSchema";
import { AllFieldTypes } from "./formDefinition";
import { InputTypeToParserMap } from "./InputDefinitionSchema";

export function stringifyIssues(error: ValiError): NonEmptyArray<string> {
    return error.issues.map(
        (issue) =>
            `${issue.path?.map((i) => i.key).join(".")}: ${issue.message} got ${issue.input}`,
    ) as NonEmptyArray<string>;
}
export class InvalidInputTypeError {
    static readonly _tag = "InvalidInputTypeError" as const;
    readonly path: string = "input.type";
    constructor(
        readonly field: FieldMinimal,
        readonly inputType: unknown,
    ) {}
    toString(): string {
        return `InvalidInputTypeError: ${this.getFieldErrors()[0]}`;
    }
    getFieldErrors(): NonEmptyArray<string> {
        return [`"input.type" is invalid, got: ${JSON.stringify(this.inputType)}`];
    }
}
export class InvalidInputError {
    static readonly _tag = "InvalidInputError" as const;
    readonly path: string;
    constructor(
        readonly field: FieldMinimal,
        readonly error: ValiError,
    ) {
        this.path = error.issues[0].path?.map((i) => i.key).join(".") ?? "";
    }
    toString(): string {
        return `InvalidInputError: ${stringifyIssues(this.error).join(", ")}`;
    }

    getFieldErrors(): NonEmptyArray<string> {
        return stringifyIssues(this.error);
    }
}

export class InvalidFieldError {
    static readonly _tag = "InvalidFieldError" as const;
    readonly path: string;
    constructor(
        public field: unknown,
        readonly error: ValiError,
    ) {
        this.path = error.issues[0].path?.map((i) => i.key).join(".") ?? "";
    }
    toString(): string {
        return `InvalidFieldError: ${stringifyIssues(this.error).join(", ")}`;
    }
    toArrayOfStrings(): string[] {
        return this.getFieldErrors();
    }
    getFieldErrors(): string[] {
        return stringifyIssues(this.error);
    }
    static of(field: unknown) {
        return (error: ValiError) => new InvalidFieldError(field, error);
    }
}

function isValidInputType(input: unknown): input is AllFieldTypes {
    return "string" === typeof input && input in InputTypeToParserMap;
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
export function findInputDefinitionSchema(
    fieldDefinition: unknown,
): E.Either<InvalidFieldError | InvalidInputTypeError, [FieldMinimal, ParsingFn<BaseSchema>]> {
    return pipe(
        parse(FieldMinimalSchema, fieldDefinition),
        E.mapLeft(InvalidFieldError.of(fieldDefinition)),
        E.chainW((field) => {
            const type = field.input.type;
            if (isValidInputType(type)) return E.right([field, InputTypeToParserMap[type]]);
            else return E.left(new InvalidInputTypeError(field, type));
        }),
    );
}
/**
 * Given an array of fields where some of them (or all) have failed to parse,
 * this function tries to find the corresponding input schema
 * and then parses the input with that schema to get the specific errors.
 * The result is a Separated of fields and field errors.
 * This is needed because valibot doesn't provide a way to get the specific error of union types
 */
export function findFieldErrors(fields: unknown[]) {
    return pipe(
        fields,
        A.partitionMap((fieldUnparsed) => {
            return pipe(
                findInputDefinitionSchema(fieldUnparsed),
                E.chainW(([field, parser]) =>
                    pipe(
                        parser(field.input),
                        E.bimap(
                            (error) => new InvalidInputError(field, error),
                            () => field,
                        ),
                    ),
                ),
            );
        }),
        // Separated.left,
    );
}
