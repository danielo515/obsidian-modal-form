export * from "fp-ts/Array";

/**
 * Update the first element in an array that satisfies a predicate
 * @param predicate - The predicate to satisfy
 * @param update - The update function
 */
export const updateFirst =
    <A>(predicate: (a: A) => boolean, update: (a: A) => A) =>
    (as: A[]): A[] => {
        return as.reduce((acc, a) => {
            if (predicate(a)) {
                acc.push(update(a));
                return acc;
            }
            acc.push(a);
            return acc;
        }, [] as A[]);
    };
