import type { FormDefinition } from "./formDefinition";

export const openPositions = {
	left: 'Left',
	right: 'Right',
	mainView: 'Main View',
	// modal: 'Modal',
} as const;
export type OpenPosition = keyof typeof openPositions;

export function isValidOpenPosition(position: string): position is OpenPosition {
	return position in openPositions;
}

export interface ModalFormSettings {
	editorPosition: OpenPosition;
	formDefinitions: FormDefinition[];
}
