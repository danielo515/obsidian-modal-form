export class TemplateError extends Error {
    public readonly _tag = "TemplateError";
    constructor(
        message: string,
        public readonly cause?: unknown,
    ) {
        super(message);
        this.name = "TemplateError";
    }

    static of(message: string) {
        return (cause: unknown) => new TemplateError(message, cause);
    }
}
