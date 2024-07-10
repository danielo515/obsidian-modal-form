type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";
function noop() {}
export class Logger {
    private static instance: Logger;
    #level: Level = process.env.NODE_ENV === "development" ? "DEBUG" : "ERROR";
    private constructor() {}

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    log(message: string) {
        console.log(message);
    }
    error(...args: unknown[]) {
        console.error(...args);
    }
    get debug() {
        if (this.#level === "DEBUG") return console.log.bind(console, "[DEBUG]");
        return noop;
    }
}

export const logger = Logger.getInstance();
