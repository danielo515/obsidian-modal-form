import * as P from 'parser-ts/Parser'
import { run } from 'parser-ts/code-frame'
import * as C from 'parser-ts/char'
import * as S from 'parser-ts/string'
import { Either, pipe } from '@std';
type TemplateText = { _tag: 'text', value: string }
type TemplateVariable = { _tag: 'variable', value: string }
type Token = TemplateText | TemplateVariable
type ParsedTemplate = Token[];

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
