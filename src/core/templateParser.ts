import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
type StringSection = { _tag: 'StringSection', value: string, startPos: number, endPos: number }
type TemplateIdentifier = { _tag: 'TemplateIdentifier', name: string, open: number, close: number }
type Tokens = StringSection | TemplateIdentifier
type ParsedTemplate = Tokens[];

function StringSection(startPos: number): StringSection {
    return { _tag: 'StringSection', value: '', startPos, endPos: startPos }
}
abstract class ParseError {
    readonly _tag: string = 'ParseError' as const
    constructor(readonly name: string, protected startPos: number) { }
}
class UnclosedSectionError extends ParseError {
    readonly _tag = 'UnclosedSection' as const
    static make(startPos: number) {
        return new UnclosedSectionError('UnclosedSection', startPos)
    }
}

interface ParseState {
    readonly input: string;
    readonly position: number;
    peek(offset: number): O.Option<string>
}

class State implements ParseState {
    constructor(readonly input: string, readonly position: number) { }
    peek(offset: number): O.Option<string> {
        return this.input.length > this.position ? O.fromNullable(this.input[this.position + 1]) : O.none
    }
    static make(input: string) {
        return new State(input, 0)
    }
}
function parseString(state: ParseState): ParseState {
    const { text, currentSection } = state
    const nextSection = StringSection(currentSection.endPos + 1)
    let i = nextSection.startPos
    while (i < text.length) {
        if (text[i] === '{' && text[i + 1] === '{') {
            nextSection.endPos = i - 1
            break
        }
        i++
    }
    return { ...state, currentSection: nextSection }
}
/**
 * Given a template string, parse it into an array of tokens.
 * Templates look like this:
 * "Hello {{name}}! You are {{age}} years old."
 * @param template a template string to convert into an array of tokens or an error
 */
function parseTemplate(template: string): E.Either<ParseError, ParsedTemplate> {
    const state = ParseState(template)

}
