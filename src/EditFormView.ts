import ModalFormPlugin from "main";
import { ItemView, Setting, ViewStateResult, WorkspaceLeaf } from "obsidian";
import { FormDefinition } from "./FormModal";
import { ModalFormError } from "./utils/Error";

export const EDIT_FORM_VIEW = "modal-form-edit-form-view";
const FieldTypeReadable = {
	"text": "Text",
	"number": "Number",
	"date": "Date",
	"time": "Time",
	"datetime": "DateTime",
	"toggle": "Toggle",
	"note": "Note",
	"slider": "Slider",
	"select": "Select"
};


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
		container.createEl("h4", { text: "Example view" });
		const controls = container.createDiv();
		const fieldsRoot = container.createDiv();
		new Setting(controls).addButton(element => {
			element.setButtonText('Add field').onClick(async () => {
				this.formState.fields.push({ name: '', description: '', input: { type: 'text' } })
				this.renderFields(fieldsRoot)
				this.app.workspace.requestSaveLayout();
			})
		})
		this.renderFields(fieldsRoot);
	}

	renderFields(root: HTMLElement) {
		root.empty();
		root.createEl("h4", { text: "Form title" });
		this.formState.fields.forEach(field => {
			new Setting(root).addDropdown(element => {
				element.addOptions(FieldTypeReadable)
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
