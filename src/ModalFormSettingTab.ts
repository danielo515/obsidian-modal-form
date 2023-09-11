import { App, PluginSettingTab, Setting } from "obsidian";
import ModalFormPlugin from "main";
import { isValidOpenPosition } from "./core/settings";

export class ModalFormSettingTab extends PluginSettingTab {
	plugin: ModalFormPlugin;

	constructor(app: App, plugin: ModalFormPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display() {
		const { containerEl, plugin } = this;
		containerEl.empty();

		const settings = await plugin.getSettings();

		new Setting(containerEl)
			.setName("Editor position")
			.setDesc("Where the form editor will be opened. In mobile it will always be main view.")
			.addDropdown(component => {
				component
					.addOptions({
						left: "Left",
						right: "Right",
						mainView: "Main View",
						modal: "Modal",
					})
					.setValue(settings.editorPosition)
					.onChange(async (value) => {
						if (isValidOpenPosition(value)) {
							await this.plugin.setEditorPosition(value)
						}
					});
			})

		// containerEl.createEl("h1", { text: "Form definitions" });
		// settings.formDefinitions.forEach((formDefinition) => {
		// 	new Setting(containerEl)
		// 		.setName(formDefinition.title)
		// 		.addButton((button) =>
		// 			button.setButtonText("Delete").onClick(async () => {
		// 				const index =
		// 					settings.formDefinitions.indexOf(formDefinition);
		// 				if (index > -1) {
		// 					settings.formDefinitions.splice(index, 1);
		// 				}
		// 				await this.plugin.saveSettings();
		// 				this.display()
		// 			})
		// 		);
		// });
	}
}
