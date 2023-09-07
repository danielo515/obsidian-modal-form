import ModalFormPlugin from "main";
import { ItemView, Setting, ViewStateResult, WorkspaceLeaf } from "obsidian";
import { FieldType, FormDefinition, AllFieldTypes } from "./FormModal";
import { ModalFormError } from "./utils/Error";

export const EDIT_FORM_VIEW = "modal-form-edit-form-view";
const FieldTypeReadable: Record<AllFieldTypes, string> = {
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


/**
 * Edits the form definition.
 * To create a new form, you just edit an empty form definition.
 * Simple, right?
 */
export class EditFormView extends ItemView {
	formState: FormDefinition = { title: '', name: '', fields: [] };
	editType: 'new-form' | 'edit-form' = 'new-form';
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
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Edit form" });
		const controls = container.createDiv();
		const fieldsRoot = container.createDiv();
		new Setting(controls).addButton(element => {
			element.setButtonText('Add field').onClick(async () => {
				this.formState.fields.push({ name: '', description: '', input: { type: 'text' } })
				await this.app.workspace.requestSaveLayout();
				this.renderFields(fieldsRoot)
			})
		})
		this.renderFields(fieldsRoot);
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
		// Nothing to clean up.
	}
	async setState(state: { type: string, state?: FormDefinition }, result: ViewStateResult): Promise<void> {
		if (state && state.state) {
			this.formState = state.state;
			this.editType = state.type as 'new-form' | 'edit-form';
			this.onOpen();
		}
		return super.setState(state, result);
	}
	getState(): { type: string, state?: FormDefinition } {
		return { type: this.editType, state: this.formState };
	}
}
