import { App, PluginSettingTab, Setting } from "obsidian";
import ModalFormPlugin from "main";

export class ModalFormSettingTab extends PluginSettingTab {
	plugin: ModalFormPlugin;

	constructor(app: App, plugin: ModalFormPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async display() {
		const { containerEl, plugin } = this;

		const settings = await plugin.getSettings();

		containerEl.empty();
		containerEl.createEl("h1", { text: "Form definitions" });

		settings.formDefinitions.forEach((formDefinition) => {
			new Setting(containerEl)
				.setName(formDefinition.title)
				.addButton((button) =>
					button.setButtonText("Delete").onClick(async () => {
						const index =
							settings.formDefinitions.indexOf(formDefinition);
						if (index > -1) {
							settings.formDefinitions.splice(index, 1);
						}
						await this.plugin.saveSettings();
						this.display()
					})
				);
		});
	}
}
