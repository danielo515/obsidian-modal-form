import { App, PluginSettingTab, Setting } from "obsidian";
import { isValidOpenPosition } from "./core/settings";
import ModalFormPlugin from "./main";

export class ModalFormSettingTab extends PluginSettingTab {
    plugin: ModalFormPlugin;

    constructor(app: App, plugin: ModalFormPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display() {
        const { containerEl, plugin } = this;
        containerEl.empty();
        containerEl.createEl("a", {
            text: "Modal Form documentation",
            cls: "nav-link",
            href: "https://github.com/danielo515/obsidian-modal-form",
        });

        const settings = await plugin.getSettings();

        new Setting(containerEl)
            .setName("Editor position")
            .setDesc("Where the form editor will be opened. In mobile it will always be main view.")
            .addDropdown((component) => {
                component
                    .addOptions({
                        left: "Left",
                        right: "Right",
                        mainView: "Main View",
                    })
                    .setValue(settings.editorPosition)
                    .onChange(async (value) => {
                        if (isValidOpenPosition(value)) {
                            await this.plugin.setEditorPosition(value);
                        }
                    });
            });

        new Setting(containerEl)
            .setName("Attach Modal-Form Shortcut to Global Window")
            .setDesc(
                "Enable or disable attaching a modal-form shortcut to the global window. If you enable this you will be able to access the API using the global variable `MF`. Enabling is immediate, disabling requires a restart.",
            )
            .addToggle((component) => {
                component
                    .setValue(settings.attachShortcutToGlobalWindow)
                    .onChange(async (value) => {
                        await this.plugin.setAttachShortcutToGlobalWindow(value);
                    });
            });

        new Setting(containerEl)
            .setName("Preserve form data")
            .setDesc(
                "Keep what you type in a form while it is open, so it can be recovered if the " +
                    "form is closed by accident or a template fails after submitting. " +
                    "The data is stored locally, never in your vault, and is discarded after a week. " +
                    "Disabling this deletes any data kept so far.",
            )
            .addToggle((component) => {
                component.setValue(settings.preserveFormDrafts).onChange(async (value) => {
                    await this.plugin.setPreserveFormDrafts(value);
                });
            });
    }
}
