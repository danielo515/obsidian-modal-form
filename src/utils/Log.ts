import { Notice } from "obsidian";
import { ModalFormError } from "./Error";


export function log_notice(title: string, msg: string): void {
	const notice = new Notice("", 15000);
	const el = notice.noticeEl;
	el.empty();
	const head = el.createEl('h6', { text: title })
	const body = el.createEl('div', { text: title })
	el.append(head, body);
}

export function log_update(msg: string): void {
	log_notice('Modal form update', msg)
}

export function log_error(e: Error | ModalFormError): void {
	if (e instanceof ModalFormError && e.console_msg) {
		log_notice('Modal from error', e.message)
		console.error(`Modal form Error:`, e.message, "\n", e.console_msg);
	} else {
		log_notice('Modal from error', e.message)
	}
}
