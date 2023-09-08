import ModalFormPlugin from "main";
import { ItemView, Setting, type ViewStateResult, WorkspaceLeaf } from "obsidian";
import type { FormDefinition, AllFieldTypes } from "./FormModal";
import FormEditor from './views/FormBuilder.svelte'

export const MANAGE_FORMS_VIEW = "modal-form-manage-forms-view";


/**
 * Manage existing forms and create new ones
 */
export class ManageFormsView extends ItemView {
	forms: FormDefinition[];
	constructor(readonly leaf: WorkspaceLeaf, readonly plugin: ModalFormPlugin) {
		super(leaf);
	}

	getViewType() {
		return MANAGE_FORMS_VIEW;
	}

	getDisplayText() {
		return "Edit form";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		const settings = await this.plugin.getSettings();
		this.forms = settings.formDefinitions;
		container.empty();
		container.createEl("h3", { text: "Manage forms" });
		this.renderControls(container.createDiv());
		this.renderForms(container.createDiv());
	}

	renderControls(root: HTMLElement) {
		new Setting(root).addButton(button => {
			button.setButtonText('Add new form').onClick(() => {
				this.plugin.createNewForm();
			})
		})
	}

	renderForms(root: HTMLElement) {
		root.empty();
		const rows = root.createDiv();
		rows.setCssStyles({ display: 'flex', flexDirection: 'column', gap: '10px' });
		this.forms.forEach(form => {
			const row = rows.createDiv()
			row.setCssStyles({ display: 'flex', flexDirection: 'row', gap: '8px' })
			row.createEl("h4", { text: form.name });
			new Setting(row)
				.setName(form.title)
				.addButton((button) =>
					button.setButtonText("Delete").onClick(async () => {
						const index =
					this.forms.indexOf(form);
						if (index > -1) {
							settings.formDefinitions.splice(index, 1);
						}
						await this.plugin.saveSettings();
						this.renderForms(root)
					})
				)
				.addButton((button) =>
					button.setButtonText("Edit").onClick(async () => {
						await this.plugin.editForm(form.name);
					})
				);
		})
	}

	async onClose() {
	}

}


