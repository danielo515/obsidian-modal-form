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

export function errorWrapperSync<T>(fn: () => T, msg: string): T | null {
	try {
		return fn();
	} catch (e: any) {
		log_error(new ModalFormError(msg, e.message));
		return null;
	}
}
