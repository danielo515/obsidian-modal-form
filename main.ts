import { FormDefinition, FormModal } from "src/FormModal";
import { MarkdownView, Notice, Plugin } from "obsidian";
import FormResult from "src/FormResult";
import { exampleModalDefinition } from "src/exampleModalDefinition";
import { ModalFormSettingTab } from "ModalFormSettingTab";

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
}
// This is the plugin entrypoint
export default class ModalFormPlugin extends Plugin {
	settings: ModalFormSettings | undefined;
	// This things will be setup in the onload function rather than constructor
	public api!: PublicAPI;

	async onload() {
		this.settings = await this.getSettings();
		this.api = {
			exampleForm: async () => {
				return new Promise((resolve) => {
					new FormModal(
						this.app,
						exampleModalDefinition,
						resolve
					).open();
				});
			},
		};

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

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new FormModal(
					this.app,
					exampleModalDefinition,
					console.info
				).open();
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new FormModal(
							this.app,
							exampleModalDefinition,
							console.log
						).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ModalFormSettingTab(this.app, this));
	}

	onunload() {}

	async getSettings(): Promise<ModalFormSettings> {
		return Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
