import { pipe } from "fp-ts/function";
import * as TE from "./TaskEither";

describe("TaskEither", () => {
    describe("catchTag", () => {
        class TaggedError extends Error {
            readonly _tag: string = "MyTag";
            constructor(message: string) {
                super(message);
            }
        }

        class OtherError extends Error {
            readonly _tag: string = "OtherTag";
            constructor(message: string) {
                super(message);
            }
        }

        class NewError extends Error {
            readonly _tag: string = "NewTag";
            constructor(message: string) {
                super(message);
            }
        }

        it("should map tagged error to a new error", async () => {
            const error = new TaggedError("Original error");
            const te = TE.left(error);

            const result = await pipe(
                te,
                TE.catchTag("MyTag", (e) => TE.left(new NewError("New error"))),
            )();

            expect(result).toEqual({
                _tag: "Left",
                left: new NewError("New error"),
            });
        });

        it("should recover from tagged error", async () => {
            const error = new TaggedError("Original error");
            const te = TE.left(error);

            const result = await pipe(
                te,
                TE.catchTag("MyTag", () => TE.of("Recovered")),
            )();

            expect(result).toEqual({
                _tag: "Right",
                right: "Recovered",
            });
        });

        it("should not affect other errors", async () => {
            const error = new OtherError("Other error");
            const te = TE.left(error);

            const result = await pipe(
                te,
                TE.catchTag("MyTag", (e) => TE.left(new NewError("New error"))),
            )();

            expect(result).toEqual({
                _tag: "Left",
                left: error,
            });
        });

        it("should not affect success values", async () => {
            const te = TE.right("Success");

            const result = await pipe(
                te,
                TE.catchTag("MyTag", (e) => TE.left(new NewError("New error"))),
            )();

            expect(result).toEqual({
                _tag: "Right",
                right: "Success",
            });
        });
    });
});
