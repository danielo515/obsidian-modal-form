import { Notice } from "obsidian";
import { ModalFormError } from "./Error";

export function log_update(msg: string): void {
	const notice = new Notice("", 15000);
	// TODO: Find better way for this
	// @ts-ignore
	notice.noticeEl.innerHTML = `<b>Modal form update</b>:<br/>${msg}`;
}

export function log_error(e: Error | ModalFormError): void {
	const notice = new Notice("", 8000);
	if (e instanceof ModalFormError && e.console_msg) {
		notice.noticeEl.innerHTML = `<b>Modal form Error</b>:<br/>${e.message}<br/>Check console for more information`;
		console.error(`Modal form Error:`, e.message, "\n", e.console_msg);
	} else {
		notice.noticeEl.innerHTML = `<b>Modal form Error</b>:<br/>${e.message}`;
	}
}
