import { pipe as p } from "fp-ts/function";
import { partitionMap } from "fp-ts/Array";
import { isLeft, isRight, tryCatchK } from "fp-ts/Either";
import { ValiError, parse as parseV } from "valibot";

export const pipe = p
export const A = {
    partitionMap
}

export const E = {
    isLeft,
    isRight,
    tryCatchK,
}

export const O = {}

export const parse = tryCatchK(parseV, (e: unknown) => e as ValiError)
