import { pipe as p, flow as f } from "fp-ts/function";
import { partitionMap, findFirst, findFirstMap, partition, map as mapArr, filter, compact, filterMap } from "fp-ts/Array";
import { map as mapO, getOrElse as getOrElseOpt, some, none, fromNullable as fromNullableOpt, fold as ofold } from 'fp-ts/Option'
import { isLeft, isRight, tryCatchK, map, getOrElse, fromNullable, right, left, mapLeft, Either, bimap, tryCatch, flatMap } from "fp-ts/Either";
import { BaseSchema, Output, ValiError, parse as parseV } from "valibot";
import { Semigroup, concatAll } from "fp-ts/Semigroup";
import { NonEmptyArray, concatAll as concatAllNea } from "fp-ts/NonEmptyArray";
export type { NonEmptyArray } from 'fp-ts/NonEmptyArray'
export type { Either, Left, Right } from 'fp-ts/Either'
export const flow = f;
export const pipe = p
export const A = {
    partitionMap,
    partition,
    compact,
    findFirst,
    findFirstMap,
    map: mapArr,
    filter,
    filterMap
}
/**
 * Non empty array
 */
export const NEA = {
    concatAll: concatAllNea
}

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
}

export const O = {
    map: mapO,
    getOrElse: getOrElseOpt,
    some, none,
    fold: ofold,
    fromNullable: fromNullableOpt,
}


export const parse = tryCatchK(parseV, (e: unknown) => e as ValiError)

type ParseOpts = Parameters<typeof parse>[2]

/**
 * 
 * curried version of parse.
 * It takes first the schema and the options
 * and produces a function that takes the input
 * and returns the result of parsing the input with the schema and options.
 */
export function parseC<S extends BaseSchema>(schema: S, options?: ParseOpts) {
    return (input: unknown) => parse(schema, input, options)
}
export type ParsingFn<S extends BaseSchema> = (input: unknown) => Either<ValiError, Output<S>>
/**
 * Concatenates two parsing functions that return Either<ValiError, B> into one.
 * If the first function returns a Right, the second function is not called.
 */
class _EFunSemigroup<A extends BaseSchema, B extends BaseSchema> implements Semigroup<ParsingFn<A>> {
    concat(f: ParsingFn<A>, g: ParsingFn<B>): (i: unknown) => Either<ValiError, unknown> {
        return (i) => {
            const fRes = f(i)
            if (isRight(fRes)) return fRes
            return g(i)
        }
    }
}

export const EFunSemigroup = new _EFunSemigroup()

/**
 * Takes an array of schemas and returns a function 
 * that tries to parse the input with each schema.
 */
export function trySchemas<S extends BaseSchema>(schemas: NonEmptyArray<S>, options?: ParseOpts) {
    const [first, ...rest] = schemas
    return pipe(
        rest,
        A.map((schema) => parseC(schema, options)),
        concatAll(EFunSemigroup)(parseC(first, options)),
    )
}

export function throttle<T extends unknown[], V>(cb: (...args: [...T]) => V, timeout?: number): (...args: [...T]) => V | undefined;
export function throttle(fn: (...args: unknown[]) => unknown, ms = 100) {
    let lastCall = 0;
    return function (...args: unknown[]) {
        const now = Date.now();
        if (now - lastCall < ms) {
            lastCall = now;//reset the last call time,so it needs cooldown time 
            return;
        }
        lastCall = now;
        return fn(...args);
    };
}

export function tap(msg: string) {
    return <T>(x: T) => {
        console.log(msg, x)
        return x
    }
}
