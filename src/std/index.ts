import { pipe as p, flow as f } from "fp-ts/function";
import {
    partitionMap,
    findFirst,
    findFirstMap,
    partition,
    map as mapArr,
    filter,
    compact,
    filterMap,
    flatten,
} from "fp-ts/Array";
import * as _O from "fp-ts/Option";
import {
    isLeft,
    isRight,
    tryCatchK,
    map,
    getOrElse,
    fromNullable,
    right,
    left,
    mapLeft,
    Either,
    bimap,
    tryCatch,
    flatMap,
    ap,
    flap,
    chainW,
    match,
} from "fp-ts/Either";
export type Option<T> = _O.Option<T>;
import { BaseSchema, Output, ValiError, parse as parseV } from "valibot";
import { Semigroup, concatAll } from "fp-ts/Semigroup";
import { NonEmptyArray, concatAll as concatAllNea } from "fp-ts/NonEmptyArray";
export type { NonEmptyArray } from "fp-ts/NonEmptyArray";
export type { Either, Left, Right } from "fp-ts/Either";
export const flow = f;
export const pipe = p;
export const A = {
    partitionMap,
    partition,
    compact,
    findFirst,
    findFirstMap,
    map: mapArr,
    filter,
    filterMap,
    flatten,
};
/**
 * Non empty array
 */
export const NEA = {
    concatAll: concatAllNea,
};

export const E = {
    isLeft,
    isRight,
    left,
    right,
    tryCatchK,
    tryCatch,
    getOrElse,
    map,
    mapLeft,
    bimap,
    flatMap,
    fromNullable,
    match,
    ap,
    flap,
    chainW,
    fold: match,
};

export const O = {
    map: _O.map,
    getOrElse: _O.getOrElse,
    some: _O.some,
    none: _O.none,
    fold: _O.fold,
    fromNullable: _O.fromNullable,
    chain: _O.chain,
    fromPredicate: _O.fromPredicate,
    isNone: _O.isNone,
    isSome: _O.isSome,
    alt: _O.alt,
    match: _O.match,
};

export const parse = tryCatchK(parseV, (e: unknown) => e as ValiError);

type ParseOpts = Parameters<typeof parse>[2];

/**
 *
 * curried version of parse.
 * It takes first the schema and the options
 * and produces a function that takes the input
 * and returns the result of parsing the input with the schema and options.
 */
export function parseC<S extends BaseSchema>(schema: S, options?: ParseOpts) {
    return (input: unknown, moreOptions?: ParseOpts) =>
        parse(schema, input, { ...options, ...moreOptions });
}
export type ParsingFn<S extends BaseSchema> = (
    input: unknown,
    options?: ParseOpts,
) => Either<ValiError, Output<S>>;
/**
 * Concatenates two parsing functions that return Either<ValiError, B> into one.
 * If the first function returns a Right, the second function is not called.
 */
class _EFunSemigroup<A extends BaseSchema, B extends BaseSchema>
    implements Semigroup<ParsingFn<A>>
{
    concat(f: ParsingFn<A>, g: ParsingFn<B>): (i: unknown) => Either<ValiError, unknown> {
        return (i) => {
            const fRes = f(i);
            if (isRight(fRes)) return fRes;
            return g(i);
        };
    }
}

export const EFunSemigroup = new _EFunSemigroup();

/**
 * Takes an array of schemas and returns a function
 * that tries to parse the input with each schema.
 */
export function trySchemas<S extends BaseSchema>(schemas: NonEmptyArray<S>, options?: ParseOpts) {
    const [first, ...rest] = schemas;
    return pipe(
        rest,
        A.map((schema) => parseC(schema, options)),
        concatAll(EFunSemigroup)(parseC(first, options)),
    );
}

export function throttle<T extends unknown[], V>(
    cb: (...args: [...T]) => V,
    timeout?: number,
): (...args: [...T]) => V | undefined;
export function throttle(fn: (...args: unknown[]) => unknown, ms = 100) {
    let lastCall = 0;
    let lastResult: unknown;
    return function (...args: unknown[]) {
        const now = Date.now();
        if (now - lastCall > ms) {
            lastResult = fn(...args);
        }
        lastCall = now;
        return lastResult;
    };
}

export function tap(msg: string) {
    return <T>(x: T) => {
        console.log(msg, x);
        return x;
    };
}

export function ensureError(e: unknown): Error {
    return e instanceof Error ? e : new Error(String(e));
}

/**
 * Creates a function from a string that is supposed to be a function body.
 * It ensures the "use strict" directive is present and returns the function.
 * Because the parsing can fail, it returns an Either.
 * The reason why the type arguments are reversed is because
 * we often know what the function input types should be, but
 * we can't trust the function body to return the correct type, so by default1t it will be unknown
 * The returned function is also wrapped to never throw and return an Either instead
 */
export function parseFunctionBody<Args extends unknown[], T>(body: string, ...args: string[]) {
    const fnBody = `"use strict";
${body}`;
    try {
        const fn = new Function(...args, fnBody) as (...args: Args) => T;
        return right(tryCatchK(fn, ensureError));
    } catch (e) {
        return left(ensureError(e));
    }
}
