import ModalFormPlugin from "main";
import { ItemView, type ViewStateResult, WorkspaceLeaf } from "obsidian";
import type { FormDefinition, AllFieldTypes } from "../core/formDefinition";
import FormEditor from './FormBuilder.svelte'

export const EDIT_FORM_VIEW = "modal-form-edit-form-view";
export const FieldTypeReadable: Record<AllFieldTypes, string> = {
	"text": "Text",
	"number": "Number",
	"date": "Date",
	"time": "Time",
	"datetime": "DateTime",
	"toggle": "Toggle",
	"note": "Note",
	"slider": "Slider",
	"select": "Select"
} as const;

function parseState(maybeState: unknown): maybeState is FormDefinition {
	if (maybeState === null) {
		return false
	}
	if (typeof maybeState !== 'object') {
		return false
	}
	if ('title' in maybeState && 'name' in maybeState && 'fields' in maybeState) {
		return true
	}
	return false;
}

/**
 * Edits the form definition.
 * To create a new form, you just edit an empty form definition.
 * Simple, right?
 */
export class EditFormView extends ItemView {
	formState: FormDefinition = { title: '', name: '', fields: [] };
	formEditor!: FormEditor;
	constructor(readonly leaf: WorkspaceLeaf, readonly plugin: ModalFormPlugin) {
		super(leaf);
		this.icon = 'note-glyph'
	}

	getViewType() {
		return EDIT_FORM_VIEW;
	}

	getDisplayText() {
		return "Edit form";
	}

	async onOpen() {
		this.formEditor = new FormEditor({
			target: this.contentEl,
			props: {
				definition: this.formState,
				app: this.app,
				onChange: () => {
					console.log(this.formState)
					this.app.workspace.requestSaveLayout()
				},
				onSubmit: (formDefinition: FormDefinition) => {
					console.log({ formDefinition });
					this.plugin.saveForm(formDefinition);
					this.plugin.closeEditForm()
				},
				onCancel: () => {
					this.plugin.closeEditForm()
				}
			}
		});
	}

	async onClose() {
		console.log('onClose of edit form called')
		this.formEditor.$destroy();
	}

	async setState(state: unknown, result: ViewStateResult): Promise<void> {
		console.log('setState of edit form called', state)
		if (parseState(state)) {
			this.formState = state;
			this.formEditor.$set({ definition: this.formState })
		}
		return super.setState(state, result);
	}
	getState() {
		return this.formState;
	}
}


