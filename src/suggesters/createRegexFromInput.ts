import { flow, pipe } from "@std";
import * as O from "fp-ts/Option";
import * as S from "fp-ts/string";

const splitString = flow(S.trim, S.split(' '));
export function createRegexFromInput(input: string): RegExp {
    return pipe(
        O.fromNullable(input),
        O.map(splitString),
        O.map((parts) => parts.join('.*')),
        O.map((s) => new RegExp(s, 'i')),
        O.getOrElse(() => new RegExp('.*'))
    );
}
