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
const open = S.fold([S.string('{{'), S.spaces])
const close = S.fold([S.spaces, S.string('}}')])
const identifier = S.many1(C.alphanum)
const templateIdentifier: TokenParser = pipe(
    identifier,
    P.between(open, close),
    P.map(TemplateVariable)
)

const EofStr = pipe(
    P.eof<string>(),
    P.map(() => ''))

export const OpenorEof = P.either(open, () => EofStr)
export const test = P.many1Till(P.item<string>(), P.lookAhead(OpenorEof))

const text: TokenParser = pipe(
    test,
    P.map((value) => TemplateText(value.join(''))))
// function parseTemplate(template: string): E.Either<ParseError, ParsedTemplate> {
const TextOrVariable: TokenParser = P.either(templateIdentifier, () => text)

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
