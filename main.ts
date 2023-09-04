import {
	App,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface ModalFormSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: ModalFormSettings = {
	mySetting: "default",
};

const exampleModalDefinition: ModalDefinition = {
	title: "Example Modal",
	fields: [
		{
			name: "Name",
			description: "It is named how?",
			type: "text",
		},
		{
			name: "Age",
			description: "How old",
			type: "number",
		},
		{
			name: "Date of Birth",
			description: "When were you born?",
			type: "date",
		},
	],
};

// Define functions and properties you want to make available to other plugins, or templater temmplates, etc
interface PublicAPI {
	exampleForm(): Promise<{ [key: string]: string }>;
}
export default class ModalFormPlugin extends Plugin {
	settings: ModalFormSettings | undefined;
	public api!: PublicAPI; // This things will be setup in the onload function rather than constructor

	async onload() {
		this.settings = await this.getSettings();
		this.api = {
			exampleForm: async () => {
				return new Promise((resolve) => {
					new SampleModal(
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
				new SampleModal(
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
						new SampleModal(
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

type FieldType = "text" | "number" | "date" | "time" | "datetime";
type ModalDefinition = {
	title: string;
	fields: { name: string; description: string; type: FieldType }[];
};
type SubmitFn = (formResult: { [key: string]: string }) => void;

class SampleModal extends Modal {
	modalDefinition: ModalDefinition;
	formResult: { [key: string]: string };
	onSubmit: SubmitFn;
	constructor(
		app: App,
		modalDefinition: ModalDefinition,
		onSubmit: SubmitFn
	) {
		super(app);
		this.modalDefinition = modalDefinition;
		this.onSubmit = onSubmit;
		this.formResult = {};
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl("h1", { text: this.modalDefinition.title });
		this.modalDefinition.fields.forEach((definition) => {
			const fieldBase = new Setting(contentEl)
				.setName(definition.name)
				.setDesc(definition.description);
			switch (definition.type) {
				case "text":
					return fieldBase.addText((text) =>
						text.onChange(async (value) => {
							this.formResult[definition.name] = value;
						})
					);
				case "number":
					return fieldBase.addText((text) => {
						text.inputEl.type = "number";
						text.onChange(async (value) => {
							if (value !== "") {
								this.formResult[definition.name] =
									Number(value) + "";
							}
						});
					});
				case "date":
					return fieldBase.addMomentFormat((moment) =>
						moment.onChange(async (value) => {
							this.formResult[definition.name] = value;
						})
					);
			}
		});
		new Setting(contentEl).addButton((btn) =>
			btn
				.setButtonText("Submit")
				.setCta()
				.onClick(() => {
					this.onSubmit(this.formResult);
					this.close();
				})
		);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
		this.formResult = {};
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
