import { log_error } from "./Log";

export class ModalFormError extends Error {
	constructor(msg: string, public console_msg?: string) {
		super(msg);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

export async function errorWrapper<T>(
	fn: () => Promise<T>,
	msg: string
): Promise<T | null> {
	try {
		return await fn();
	} catch (e: any) {
		if (!(e instanceof ModalFormError)) {
			log_error(new ModalFormError(msg, e.message));
		} else {
			log_error(e);
		}
		return null;
	}
}

/**
 * I case of error, logs it to the console and to the UI
 * and returns null
 * @export
 * @template T
 * @param {() => T} fn
 * @param {string} msg
 * @return {*}  {(T | null)}
 */
export function tryCatch<T>(fn: () => T, msg: string): T | null {
	try {
		return fn();
	} catch (e) {
		if (e instanceof Error)
			log_error(new ModalFormError(msg, e.message));
		return null;
	}
}
