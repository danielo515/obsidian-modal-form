import { FormDefinition } from "src/FormModal";
import { Notice, Plugin } from "obsidian";
import FormResult from "src/FormResult";
import { exampleModalDefinition } from "src/exampleModalDefinition";
import { ModalFormSettingTab } from "ModalFormSettingTab";
import { API } from "src/API";
import { EDIT_FORM_VIEW, EditFormView } from "src/EditFormView";

// Remember to rename these classes and interfaces!

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

	async onload() {
		this.settings = await this.getSettings();
		if (this.settings.formDefinitions.length === 0) {
			this.settings.formDefinitions.push(exampleModalDefinition);
		}
		this.api = new API(this.app, this);
		this.registerView(EDIT_FORM_VIEW, (leaf) => new EditFormView(leaf, this));

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"form",
			"Edit forms",
			(evt: MouseEvent) => {
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		this.addCommand({
			id: "modal-form-new-form",
			name: "New form",
			callback: async () => {
				const leaf = await this.activateView();
				leaf.setViewState({ type: 'new-form', state: { title: '', name: '', fields: [] } })

			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ModalFormSettingTab(this.app, this));
	}

	async editForm(formName: string) {
		const formDefinition = this.settings?.formDefinitions.find(form => form.name === formName);
		if (!formDefinition) {
			throw new Error(`Form ${formName} not found`)
		}
		const leaf = await this.activateView();
		leaf.setViewState({ type: 'edit-form', state: formDefinition });

	}

	onunload() { }

	async activateView() {
		this.app.workspace.detachLeavesOfType(EDIT_FORM_VIEW);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: EDIT_FORM_VIEW,
			active: true,
		});

		const leave = this.app.workspace.getLeavesOfType(EDIT_FORM_VIEW)[0]
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
