import { Either, O, parse, pipe } from "@std";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as R from "fp-ts/Record";
import { absurd, constUndefined, identity } from "fp-ts/function";
import * as St from "fp-ts/string";
import { stringifyYaml } from "obsidian";
import * as P from "parser-ts/Parser";
import * as C from "parser-ts/char";
import * as S from "parser-ts/string";
import { ModalFormData, Val } from "../FormResult";
import {
    transformations,
    type FrontmatterCommand,
    type TemplateText,
    type TemplateVariable,
    type Transformations,
} from "./templateSchema";
type Token = TemplateText | TemplateVariable | FrontmatterCommand;
export type ParsedTemplate = Token[];

function TemplateText(value: string): TemplateText {
    return { _tag: "text", value };
}
function TemplateVariable(value: string, transformation?: Transformations): TemplateVariable {
    return { _tag: "variable", value, transformation };
}

function FrontmatterCommand(pick: string[] = [], omit: string[] = []): FrontmatterCommand {
    return { _tag: "frontmatter-command", pick, omit };
}

// === Parsers ===
type TokenParser = P.Parser<string, Token>;
// A parser that returns an empty string when it reaches the end of the input.
// required to keep the same type as the other parsers.
const EofStr = pipe(
    P.eof<string>(),
    P.map(() => ""),
);
// === Variable Parser ===
const open = S.fold([S.string("{{"), S.spaces]);
const close = P.expected(S.fold([S.spaces, S.string("}}")]), 'closing variable tag: "}}"');
const identifier = S.many1(C.alphanum);
const transformation = pipe(
    S.fold([S.spaces, S.string("|"), S.spaces]),
    P.apSecond(identifier),
    P.map((x) => {
        return pipe(
            parse(transformations, x),
            E.fold(constUndefined, (x) => x),
        );
    }),
);

const templateIdentifier: TokenParser = pipe(
    identifier, // First, we parse the variable name
    // chain takes a function that accepts the result of the previous parser and returns a new parser
    P.chain((value) =>
        pipe(
            // Within this pipe we build a parser of Parser<string, TemplateVariable> also using the value of the previous parser
            P.optional(transformation),
            P.map((trans) => TemplateVariable(value, O.toUndefined(trans))),
        ),
    ),
    // finally we wrap the resulting parser in between the open and close strings
    P.between(open, close),
);

// === Command Parser ===
const commandOpen = S.fold([S.string("{#"), S.spaces]);
const commandClose = P.expected(S.fold([S.spaces, S.string("#}")]), 'a closing command tag: "#}"');
const sepByComma = P.sepBy(S.fold([C.char(","), S.spaces]), identifier);
const commandOptionParser = (option: string) =>
    pipe(
        S.fold([S.string(option), S.spaces]),
        // dam prettier
        P.apSecond(sepByComma),
    );

const frontmatterCommandParser = pipe(
    S.fold([S.string("frontmatter"), S.spaces]),
    P.apSecond(P.optional(commandOptionParser("pick:"))),
    //P.apFirst(S.spaces),
    // P.chain(commandOptionParser("pick:")),
);

// the frontmatter command looks like this:
// {# frontmatter pick: name, age, omit: id #}
const commandParser = pipe(
    frontmatterCommandParser,
    P.between(commandOpen, commandClose),
    P.map((value) => {
        return pipe(
            value,
            O.fold(() => [], identity),
            FrontmatterCommand,
        );
    }),
);

export const OpenOrEof = pipe(
    open,
    P.alt(() => commandOpen),
    P.alt(() => EofStr),
);
export const anythingUntilOpenOrEOF = P.many1Till(P.item<string>(), P.lookAhead(OpenOrEof));

const text: TokenParser = pipe(
    anythingUntilOpenOrEOF,
    P.map((value) => TemplateText(value.join(""))),
);
// function parseTemplate(template: string): E.Either<ParseError, ParsedTemplate> {
const TextOrVariable: TokenParser = pipe(
    templateIdentifier,
    P.alt((): TokenParser => commandParser),
    P.alt(() => text),
);

const Template = pipe(
    P.many(TextOrVariable),
    // dam prettier
    P.apFirst(P.eof()),
);
/**
 * Given a template string, parse it into an array of tokens.
 * Templates look like this:
 * "Hello {{name}}! You are {{age}} years old."
 * @param template a template string to convert into an array of tokens or an error
 */
export function parseTemplate(template: string): Either<string, ParsedTemplate> {
    return pipe(
        Template,
        S.run(template),
        E.fold(
            ({ expected }) => E.left(`Expected ${expected.join(" or ")}`),
            (result) => E.right(result.value),
        ),
    );
    // return S.run(template)(P.many(Template))
}

/**
 * Given a parsed template, returns a list of the variables used in the template
 */
export function templateVariables(parsedTemplate: ReturnType<typeof parseTemplate>): string[] {
    return pipe(
        parsedTemplate,
        E.fold(
            () => [],
            A.filterMap((token) => {
                if (token._tag === "variable") {
                    return O.some(token.value);
                }
                return O.none;
            }),
        ),
    );
}

export function templateError(
    parsedTemplate: ReturnType<typeof parseTemplate>,
): string | undefined {
    return pipe(
        parsedTemplate,
        E.fold(
            (error) => error,
            () => undefined,
        ),
    );
}

function tokenToString(token: Token): string {
    const tag = token._tag;
    switch (tag) {
        case "text":
            return token.value;
        case "variable":
            return `{{${token.value}${token.transformation ? `|${token.transformation}` : ""}}}`;
        case "frontmatter-command":
            return `{{# frontmatter pick: ${token.pick.join(", ")}, omit: ${token.omit.join(
                ", ",
            )} #}}`;
        default:
            return absurd(tag);
    }
}

function matchToken<T>(
    onText: (value: string) => T,
    onVariable: (variable: string, transformation?: Transformations) => T,
    onCommand: (command: FrontmatterCommand) => T,
) {
    return (token: Token): T => {
        switch (token._tag) {
            case "text":
                return onText(token.value);
            case "variable":
                return onVariable(token.value, token.transformation);
            case "frontmatter-command":
                return onCommand(token);
            default:
                return absurd(token);
        }
    };
}

/**
 * Given a correctly parsed template, convert it back into a string
 * with the right format: variables are surrounded by double curly braces, etc.
 * If a template is correct you should be able to parse it and then convert it back
 * to a string without losing any information.
 * @param parsedTemplate the template in it's already parsed form
 * @returns string
 */
export function parsedTemplateToString(parsedTemplate: ParsedTemplate): string {
    return pipe(
        // prettier shut up
        parsedTemplate,
        A.foldMap(St.Monoid)(tokenToString),
    );
}

function asFrontmatterString(data: Record<string, unknown>) {
    return ({ pick, omit }: { pick: string[]; omit: string[] }): string =>
        pipe(
            data,
            R.filterMapWithIndex((key, value) => {
                if (pick.length === 0) return O.some(value);
                return pick.includes(key) ? O.some(value) : O.none;
            }),
            R.filterMapWithIndex((key, value) => (!omit.includes(key) ? O.some(value) : O.none)),
            stringifyYaml,
        );
}

function executeTransformation(
    transformation: Transformations | undefined,
): (value: Val) => string {
    return (value) => {
        if (transformation === undefined) {
            return String(value);
        }
        switch (transformation) {
            case "upper":
                return String(value).toUpperCase();
            case "lower":
                return String(value).toLowerCase();
            case "stringify":
                return JSON.stringify(value);
            case "trim":
                return String(value).trim();
            default:
                return absurd(transformation);
        }
    };
}

export function executeTemplate(parsedTemplate: ParsedTemplate, formData: ModalFormData) {
    const toFrontmatter = asFrontmatterString(formData); // Build it upfront rater than on every call
    return pipe(
        parsedTemplate,
        A.filterMap(
            matchToken(
                O.some,
                (key, transformation) =>
                    pipe(
                        O.fromNullable(formData[key]),
                        O.map(executeTransformation(transformation)),
                    ),
                (command) =>
                    pipe(
                        //prettier
                        command,
                        toFrontmatter,
                        O.some,
                    ),
            ),
        ),
        A.foldMap(St.Monoid)(String),
    );
}
