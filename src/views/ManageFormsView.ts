import ModalFormPlugin from "main";
import { ItemView, Setting, WorkspaceLeaf } from "obsidian";
import { type FormDefinition } from "../core/formDefinition";

export const MANAGE_FORMS_VIEW = "modal-form-manage-forms-view";


/**
 * Manage existing forms and create new ones
 */
export class ManageFormsView extends ItemView {
	constructor(readonly leaf: WorkspaceLeaf, readonly plugin: ModalFormPlugin) {
		super(leaf);
		this.icon = "documents";
	}

	getViewType() {
		return MANAGE_FORMS_VIEW;
	}

	getDisplayText() {
		return "Manage forms";
	}

	async onOpen() {
		// console.log('On open manage forms');
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h3", { text: "Manage forms" });
		this.renderControls(container.createDiv());
		await this.renderForms(container.createDiv());
	}

	renderControls(root: HTMLElement) {
		new Setting(root).addButton(button => {
			button.setButtonText('Add new form').onClick(() => {
				this.plugin.createNewForm();
			})
		})
	}

	async renderForms(root: HTMLElement) {

		const settings = await this.plugin.getSettings();
		const forms = settings.formDefinitions;
		root.empty();
		const rows = root.createDiv();
		rows.setCssStyles({ display: 'flex', flexDirection: 'column', gap: '10px' });
		forms.forEach(form => {
			const row = rows.createDiv()
			row.setCssStyles({ display: 'flex', flexDirection: 'row', gap: '8px' })
			row.createEl("h4", { text: form.name });
			new Setting(row)
				.setName(form.title)
				.addButton((button) =>
					button.setButtonText("Delete").onClick(async () => {
						await this.plugin.deleteForm(form.name);
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


