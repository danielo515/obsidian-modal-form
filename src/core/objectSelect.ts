import { E, parse, pipe } from "@std";
import * as O from "fp-ts/Option";
import * as NEA from "fp-ts/NonEmptyArray";
import { filterWithIndex } from "fp-ts/lib/Record";
import { object, optional, array, string, coerce } from "valibot";

const KeysSchema = array(coerce(string(), String))

const PickOmitSchema = object({
    pick: optional(KeysSchema),
    omit: optional(KeysSchema),
});

function picKeys(obj: Record<string, unknown>) {
    return (keys: string[]) =>
        pipe(obj,
            filterWithIndex((k) => keys.includes(k))
        );
}

/**
 * Utility to pick/omit keys from an object.
 * It is user facing, that's why we are so defensive in the options.
 * The object should come from the form results, so we don't need to be that strict.
 * @param obj the object you want to pick/omit from
 * @param opts the options for picking/omitting based on key names
 */
export function objectSelect(obj: Record<string, unknown>, opts: unknown): Record<string, unknown> {
    return pipe(
        parse(PickOmitSchema, opts, { abortEarly: true }),
        E.map((opts) => {
            const picked = pipe(
                O.fromNullable(opts.pick),
                O.flatMap(NEA.fromArray),
                O.map(picKeys(obj)),
                O.getOrElse(() => obj)
            );
            return pipe(
                O.fromNullable(opts.omit),
                O.map((omit) =>
                    filterWithIndex((k) => !omit.includes(k))(picked)),
                O.getOrElse(() => picked)
            )
        }
        ),
        E.getOrElse(() => obj)
    )
}

