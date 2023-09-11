import { Notice, Platform, Plugin } from "obsidian";
import FormResult from "src/FormResult";
import { exampleModalDefinition } from "src/exampleModalDefinition";
import { ModalFormSettingTab } from "ModalFormSettingTab";
import { API } from "src/API";
import { EDIT_FORM_VIEW, EditFormView } from "src/EditFormView";
import { MANAGE_FORMS_VIEW, ManageFormsView } from "src/views/ManageFormsView";
import { ModalFormError } from "src/utils/Error";
import type { FormDefinition } from "src/core/formDefinition";

// Remember to rename these classes and interfaces!

type ViewType = typeof EDIT_FORM_VIEW | typeof MANAGE_FORMS_VIEW;

interface ModalFormSettings {
	formDefinitions: FormDefinition[];
}

const DEFAULT_SETTINGS: ModalFormSettings = {
	formDefinitions: [],
};

// Define functions and properties you want to make available to other plugins, or templater temmplates, etc
interface PublicAPI {
	exampleForm(): Promise<FormResult>;
	openForm(name: string): Promise<FormResult>;
}
// This is the plugin entrypoint
export default class ModalFormPlugin extends Plugin {
	settings: ModalFormSettings | undefined;
	// This things will be setup in the onload function rather than constructor
	public api!: PublicAPI;

	manageForms() {
		return this.activateView(MANAGE_FORMS_VIEW);
	}

	createNewForm() {
		return this.activateView(EDIT_FORM_VIEW);
	}

	async editForm(formName: string) {
		const formDefinition = this.settings?.formDefinitions.find(form => form.name === formName);
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
			id: "modal-form-new-form",
			name: "New form",
			callback: () => {
				this.createNewForm();
			},
		});
		this.addCommand({
			id: "modal-form-manage-forms",
			name: "Manage forms",
			callback: () => {
				this.manageForms();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ModalFormSettingTab(this.app, this));
	}

	closeEditForm() {
		this.app.workspace.detachLeavesOfType(EDIT_FORM_VIEW);
	}


	onunload() { }

	async activateView(viewType: ViewType, state?: FormDefinition) {
		this.app.workspace.detachLeavesOfType(viewType);

		if (Platform.isMobile) {
			await this.app.workspace.getLeaf(false).setViewState({
				type: viewType,
				active: true,
				state,
			});
		} else {
			await this.app.workspace.getRightLeaf(false).setViewState({
				type: viewType,
				active: true,
				state,
			});
		}

		const leave = this.app.workspace.getLeavesOfType(viewType)[0]
		this.app.workspace.revealLeaf(
			leave
		);
		return leave;
	}

	async getSettings(): Promise<ModalFormSettings> {
		return Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
