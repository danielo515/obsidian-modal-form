import { App, PluginSettingTab, Setting } from "obsidian";
import ModalFormPlugin from "main";

export class ModalFormSettingTab extends PluginSettingTab {
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
