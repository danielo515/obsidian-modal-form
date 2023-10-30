import { pipe as p } from "fp-ts/function";
import { partitionMap, partition, map as mapArr } from "fp-ts/Array";
import { isLeft, isRight, tryCatchK, map, getOrElse, right, left, mapLeft, Either } from "fp-ts/Either";
import { BaseSchema, ValiError, parse as parseV } from "valibot";
import { Semigroup, concatAll } from "fp-ts/Semigroup";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
export type { NonEmptyArray } from 'fp-ts/NonEmptyArray'

export const pipe = p
export const A = {
    partitionMap,
    partition,
    map: mapArr,
}

export const E = {
    isLeft,
    isRight,
    left,
    right,
    tryCatchK,
    getOrElse,
    map,
    mapLeft,
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

/**
 * Concatenates two parsing functions that return Either<ValiError, B> into one.
 * If the first function returns a Right, the second function is not called.
 */
class _EFunSemigroup<A, B> implements Semigroup<(i: A) => Either<ValiError, B>> {
    concat(f: (i: A) => Either<ValiError, B>, g: (i: A) => Either<ValiError, B>): (i: A) => Either<ValiError, B> {
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
