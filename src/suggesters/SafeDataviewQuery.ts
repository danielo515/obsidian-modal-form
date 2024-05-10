import { parseFunctionBody, pipe } from "@std";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { App } from "obsidian";
import { log_error } from "src/utils/Log";
import { ModalFormError } from "src/utils/ModalFormError";

//type DataviewQuery = (dv: unknown, pages: unknown) => unknown;
export type SafeDataviewQuery = (
    dv: unknown,
    pages: unknown,
) => TE.TaskEither<ModalFormError, string[]>;
/**
 * From a string representing a dataview query, it returns the safest possible
 * function that can be used to evaluate the query.
 * The function is sandboxed and it will return an Either<ModalFormError, string[]>.
 * If you want a convenient way to execute the query, use executeSandboxedDvQuery.
 * @param query string representing a dataview query that will be evaluated in a sandboxed environment
 * @returns SafeDataviewQuery
 */
export function sandboxedDvQuery(query: string): SafeDataviewQuery {
    if (!query.startsWith("return")) {
        query = "return " + query;
    }
    const parsed = parseFunctionBody<[unknown, unknown], unknown>(query, "dv", "pages");
    return (dv: unknown, pages: unknown) =>
        pipe(
            parsed,
            TE.fromEither,
            TE.mapLeft(
                (err) => new ModalFormError("Error evaluating the dataview query", err.message),
            ),
            TE.flatMap((fn) => fn(dv, pages)),
            TE.flatMap((result) => {
                if (!Array.isArray(result)) {
                    return TE.left(
                        new ModalFormError("The dataview query did not return an array"),
                    );
                }
                return TE.right(result);
            }),
        );
}

type logger = typeof log_error;

/**
 * Executes and unwraps the result of a SafeDataviewQuery.
 * Use this function if you want a convenient way to execute the query.
 * It will log the errors to the UI and return an empty array if the query fails.
 * @param query SafeDataviewQuery to execute
 * @param app the global obsidian app
 * @returns string[] if the query was executed successfully, otherwise an empty array
 */
export function executeSandboxedDvQuery(
    query: SafeDataviewQuery,
    app: App,
    logger: logger = log_error,
): T.Task<string[]> {
    const dv = app.plugins.plugins.dataview?.api;

    if (!dv) {
        logger(new ModalFormError("Dataview plugin is not enabled"));
        return T.of([]);
    }
    const pages = dv.pages;
    return pipe(
        query(dv, pages),
        TE.getOrElse((e) => {
            logger(e);
            return T.of([] as string[]);
        }),
    );
}
