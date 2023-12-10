import * as E from 'fp-ts/Either';
import * as St from 'fp-ts/String'
import * as P from 'parser-ts/Parser'
import { run } from 'parser-ts/code-frame'
import * as J from 'fp-ts/Json'
import * as C from 'parser-ts/char'
import * as S from 'parser-ts/string'
import * as A from 'fp-ts/Array'
import { Either, O, pipe } from '@std';
import { TemplateText, TemplateVariable } from './templateSchema';
import { absurd } from 'fp-ts/function';
import { ModalFormData } from '../FormResult';
type Token = TemplateText | TemplateVariable
export type ParsedTemplate = Token[];

function TemplateText(value: string): TemplateText {
    return { _tag: 'text', value }
}
function TemplateVariable(value: string): TemplateVariable {
    return { _tag: 'variable', value }
}


// === Parsers ===
type TokenParser = P.Parser<string, Token>
// A parser that returns an empty string when it reaches the end of the input.
// required to keep the same type as the other parsers.
const EofStr = pipe(
    P.eof<string>(),
    P.map(() => ''))
const open = S.fold([S.string('{{'), S.spaces])
const close = P.expected(S.fold([S.spaces, S.string('}}')]), 'closing variable tag: "}}"')
const identifier = S.many1(C.alphanum)
const templateIdentifier: TokenParser = pipe(
    identifier,
    P.between(open, close),
    P.map(TemplateVariable),
)


export const OpenOrEof = P.either(open, () => EofStr)
export const anythingUntilOpenOrEOF = P.many1Till(P.item<string>(), P.lookAhead(OpenOrEof))

const text: TokenParser = pipe(
    anythingUntilOpenOrEOF,
    P.map((value) => TemplateText(value.join(''))))
// function parseTemplate(template: string): E.Either<ParseError, ParsedTemplate> {
const TextOrVariable: TokenParser = pipe(
    templateIdentifier,
    P.alt(() => text),
)

const Template = pipe(
    P.many(TextOrVariable),
    P.apFirst(P.eof()),
)
/**
 * Given a template string, parse it into an array of tokens.
 * Templates look like this:
 * "Hello {{name}}! You are {{age}} years old."
 * @param template a template string to convert into an array of tokens or an error
 */
export function parseTemplate(template: string): Either<string, ParsedTemplate> {
    return run((Template), template)
    // return S.run(template)(P.many(Template))
}

export function templateVariables(parsedTemplate: ReturnType<typeof parseTemplate>): string[] {
    return pipe(
        parsedTemplate,
        E.fold(
            () => [],
            A.filterMap((token) => {
                if (token._tag === 'variable') {
                    return O.some(token.value)
                }
                return O.none
            }))
    )
}

export function templateError(parsedTemplate: ReturnType<typeof parseTemplate>): string | undefined {
    return pipe(
        parsedTemplate,
        E.fold(
            (error) => error,
            () => undefined
        )
    )
}

function tokenToString(token: Token): string {
    const tag = token._tag
    switch (tag) {
        case 'text': return token.value
        case 'variable': return `{{${token.value}}}`
        default:
            return absurd(tag)
    }
}

function matchToken<T>(onText: (value: string) => T, onVariable: (variable: string) => T) {
    return (token: Token): T => {
        switch (token._tag) {
            case 'text': return onText(token.value)
            case 'variable': return onVariable(token.value)
            default:
                return absurd(token)
        }
    }
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
        parsedTemplate,
        A.foldMap(St.Monoid)(tokenToString)
    )
}

export function executeTemplate(parsedTemplate: ParsedTemplate, formData: ModalFormData) {
    return pipe(
        parsedTemplate,
        A.filterMap(
            matchToken(O.some, (key) => O.fromNullable(formData[key]))
        ),
        A.foldMap(St.Monoid)(String)
    )
}
