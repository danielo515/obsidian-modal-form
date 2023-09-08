import ModalFormPlugin from "main";
import { ItemView, Setting, type ViewStateResult, WorkspaceLeaf } from "obsidian";
import type { FieldType, FormDefinition, AllFieldTypes } from "./FormModal";
import FormEditor from './views/FormBuilder.svelte'

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

export type EditFormViewState = {
	type: 'new-form' | 'edit-form',
	state?: FormDefinition
}

/**
 * Edits the form definition.
 * To create a new form, you just edit an empty form definition.
 * Simple, right?
 */
export class EditFormView extends ItemView {
	formState: FormDefinition = { title: 'New form', name: '', fields: [] };
	editType: 'new-form' | 'edit-form' = 'new-form';
	formEditor!: FormEditor;
	constructor(readonly leaf: WorkspaceLeaf, readonly plugin: ModalFormPlugin) {
		super(leaf);
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
				fields: this.formState.fields,
				onChange: () => {
					console.log(this.formState)
					this.app.workspace.requestSaveLayout()
				}
			}
		});
	}

	renderFields(root: HTMLElement) {
		root.empty();
		root.createEl("h4", { text: "Fields" });
		const rows = root.createDiv();
		rows.setCssStyles({ display: 'flex', flexDirection: 'column', gap: '10px' });
		this.formState.fields.forEach(field => {
			const row = rows.createDiv()
			row.setCssStyles({ display: 'flex', flexDirection: 'row', gap: '8px' })
			new Setting(row)
				.addText(text => {
					text.setPlaceholder('Field name').setValue(field.name).onChange(value => {
						field.name = value;
						this.app.workspace.requestSaveLayout();
					})
				})
				.addText(element => {
					element.setPlaceholder('Field description').setValue(field.description).onChange(value => {
						field.description = value;
						this.app.workspace.requestSaveLayout();
					})
				})
				.addDropdown(element => {
					element.addOptions(FieldTypeReadable)
					element.setValue(field.input.type)
					element.onChange((value) => {
						field.input.type = value as AllFieldTypes;
						this.app.workspace.requestSaveLayout();
					})
				})
		})
	}

	async onClose() {
		this.formEditor.$destroy();
	}

	async setState(state: { type: string, state?: FormDefinition }, result: ViewStateResult): Promise<void> {
		if (state && state.state) {
			this.formState = state.state;
			this.editType = state.type as 'new-form' | 'edit-form';
			this.formEditor.$set({ fields: this.formState.fields })
		}
		return super.setState(state, result);
	}
	getState(): { type: string, state?: FormDefinition } {
		return { type: this.editType, state: this.formState };
	}
}


