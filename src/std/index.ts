import { pipe as p } from "fp-ts/function";
import { partitionMap, partition, map as mapArr } from "fp-ts/Array";
import { isLeft, isRight, tryCatchK, map, getOrElse, right, left, mapLeft } from "fp-ts/Either";
import { ValiError, parse as parseV } from "valibot";

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
