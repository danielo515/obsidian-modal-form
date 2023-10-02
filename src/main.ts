import { Platform, Plugin, WorkspaceLeaf } from "obsidian";
import FormResult from "src/FormResult";
import { exampleModalDefinition } from "src/exampleModalDefinition";
import { ModalFormSettingTab } from "src/ModalFormSettingTab";
import { API } from "src/API";
import { EDIT_FORM_VIEW, EditFormView } from "src/views/EditFormView";
import { MANAGE_FORMS_VIEW, ManageFormsView } from "src/views/ManageFormsView";
import { ModalFormError } from "src/utils/Error";
import type { FormDefinition } from "src/core/formDefinition";
import type { ModalFormSettings, OpenPosition } from "src/core/settings";

// Remember to rename these classes and interfaces!

type ViewType = typeof EDIT_FORM_VIEW | typeof MANAGE_FORMS_VIEW;

const DEFAULT_SETTINGS: ModalFormSettings = {
	editorPosition: "right",
	formDefinitions: [],
};

// Define functions and properties you want to make available to other plugins, or templater templates, etc
interface PublicAPI {
	exampleForm(): Promise<FormResult>;
	openForm(formReference: string | FormDefinition): Promise<FormResult>
}
// This is the plugin entrypoint
export default class ModalFormPlugin extends Plugin {
	public settings: ModalFormSettings | undefined;
	// This things will be setup in the onload function rather than constructor
	public api!: PublicAPI;

	manageForms() {
		return this.activateView(MANAGE_FORMS_VIEW);
	}

	createNewForm() {
		return this.activateView(EDIT_FORM_VIEW);
	}

	formExists(formName: string): boolean {
		return this.settings?.formDefinitions.some(form => form.name === formName) ?? false;
	}

	async duplicateForm(form: FormDefinition) {
		const newForm = { ...form };
		newForm.name = form.name + '-copy';
		let i = 1;
		while (this.formExists(newForm.name)) {
			newForm.name = form.name + '-copy-' + i;
			i++;
		}
		await this.saveForm(newForm);
	}

	async editForm(formName: string) {
		// By reading settings from the disk we get a copy of the form
		// effectively preventing any unexpected side effects to the running configuration
		// For example, mutating a form, cancelling the edit but the form is already mutated,
		// then if you save another form you will unexpectedly save the mutated form too.
		// Maybe we could instead do a deep copy instead, but until this proven to be a bottleneck I will leave it like this.
		const savedSettings = await this.getSettings();
		const formDefinition = savedSettings.formDefinitions.find(form => form.name === formName);
		if (!formDefinition) {
			throw new ModalFormError(`Form ${formName} not found`)
		}
		await this.activateView(EDIT_FORM_VIEW, formDefinition);

	}

	async saveForm(formDefinition: FormDefinition) {
		const index = this.settings?.formDefinitions.findIndex(form => form.name === formDefinition.name);
		if (index === undefined || index === -1) {
			this.settings?.formDefinitions.push(formDefinition);
		} else {
			this.settings?.formDefinitions.splice(index, 1, formDefinition);
		}
		console.log(this.settings, index)
		await this.saveSettings();
		// go back to manage forms and refresh it
		await this.activateView(MANAGE_FORMS_VIEW);
	}
	async deleteForm(formName: string) {
		// This should never happen, but because obsidian plugin life-cycle we can not guarantee that the settings are loaded
		if (!this.settings) {
			throw new ModalFormError('Settings not found')
		}
		this.settings.formDefinitions = this.settings.formDefinitions.filter(form => form.name !== formName);
		await this.saveSettings();
	}


	closeEditForm() {
		this.app.workspace.detachLeavesOfType(EDIT_FORM_VIEW);
	}


	onunload() { }

	async activateView(viewType: ViewType, state?: FormDefinition) {
		this.app.workspace.detachLeavesOfType(viewType);

		let leaf: WorkspaceLeaf;
		if (Platform.isMobile || this.settings?.editorPosition === "mainView") {
			leaf = this.app.workspace.getLeaf(false)
		} else if (this.settings?.editorPosition === "right") {
			leaf = this.app.workspace.getRightLeaf(false);
		} else if (this.settings?.editorPosition === "left") {
			leaf = this.app.workspace.getLeftLeaf(false);
		} else if (this.settings?.editorPosition === "modal") {
			leaf = this.app.workspace.getLeaf(false)
		} else {
			leaf = this.app.workspace.getRightLeaf(false)
		}

		await leaf.setViewState({
			type: viewType,
			active: true,
			state,
		});
		const leave = this.app.workspace.getLeavesOfType(viewType)[0]
		this.app.workspace.revealLeaf(
			leave
		);
		return leave;
	}

	async getSettings(): Promise<ModalFormSettings> {
		return Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	private async saveSettings() {
		await this.saveData(this.settings);
	}

	async setEditorPosition(position: OpenPosition) {
		this.settings!.editorPosition = position;
		await this.saveSettings();
	}

	async onload() {
		this.settings = await this.getSettings();
		if (this.settings.formDefinitions.length === 0) {
			this.settings.formDefinitions.push(exampleModalDefinition);
		}
		this.api = new API(this.app, this);
		this.registerView(EDIT_FORM_VIEW, (leaf) => new EditFormView(leaf, this));
		this.registerView(MANAGE_FORMS_VIEW, (leaf) => new ManageFormsView(leaf, this));

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"documents",
			"Edit forms",
			(evt: MouseEvent) => {
				this.manageForms()
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		this.addCommand({
			id: "new-form",
			name: "New form",
			callback: () => {
				this.createNewForm();
			},
		});
		this.addCommand({
			id: "manage-forms",
			name: "Manage forms",
			callback: () => {
				this.manageForms();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ModalFormSettingTab(this.app, this));
	}

}
