import { FormDefinition, FormModal } from "src/FormModal";
import {
	App,
	MarkdownView,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import FormResult from "src/FormResult";

// Remember to rename these classes and interfaces!

interface ModalFormSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ModalFormSettings = {
	mySetting: "default",
};

const exampleModalDefinition: FormDefinition = {
	title: "Example Modal",
	fields: [
		// example of how name will be used as label if label is missing.
		{
			name: "Name",
			description: "It is named how?",
			type: "text",
		},
		{
			name: "age",
			label: "Age",
			description: "How old",
			type: "number",
		},
		{
			name: "dateOfBirth",
			label: "Date of Birth",
			description: "When were you born?",
			type: "date",
		},
		{
			name: "timeOfDay",
			label: "Time of day",
			description: "The time you can do this",
			type: "time",
		},
		{
			name: "likes_sex",
			label: "Likes sex",
			description: "If likes to have sex",
			type: "toggle",
		},
	],
};

// Define functions and properties you want to make available to other plugins, or templater temmplates, etc
interface PublicAPI {
	exampleForm(): Promise<FormResult>;
}
export default class ModalFormPlugin extends Plugin {
	settings: ModalFormSettings | undefined;
	public api!: PublicAPI; // This things will be setup in the onload function rather than constructor

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
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

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

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async getSettings() {
		return Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ModalFormSettingTab extends PluginSettingTab {
	plugin: ModalFormPlugin;

	constructor(app: App, plugin: ModalFormPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings?.mySetting || "")
					.onChange(async (value) => {
						// this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
