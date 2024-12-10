import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

/**
 * Maps a specific tagged error from a TaskEither's left channel using a mapping function.
 * The mapping function can either transform the error into a new error type or recover it into a success value.
 * All other errors or successful values will continue unchanged.
 *
 * @param tag - The _tag value to match against errors
 * @param f - A function that maps the tagged error to either a new error or a success value
 * @param te - The TaskEither to process
 * @returns A new TaskEither with the specified error mapped according to the mapping function
 */
export const catchTag =
    <Tag extends string, E extends { _tag: string }, A, NewE>(
        tag: Tag,
        f: (e: Extract<E, { _tag: Tag }>) => TE.TaskEither<NewE, A>,
    ) =>
    (te: TE.TaskEither<E, A>): TE.TaskEither<NewE | Exclude<E, { _tag: Tag }>, A> => {
        return pipe(
            te,
            TE.fold(
                (error): TE.TaskEither<NewE | Exclude<E, { _tag: Tag }>, A> => {
                    if (error._tag === tag) {
                        return f(error as Extract<E, { _tag: Tag }>);
                    }
                    // Keep other errors in the left channel
                    return TE.left(error as Exclude<E, { _tag: Tag }>);
                },
                (value) => TE.right(value),
            ),
        );
    };
