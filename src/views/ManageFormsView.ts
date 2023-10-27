import { FormDefinition, MigrationError } from "src/core/formDefinition";
import ManageForms from './ManageForms.svelte'
import ModalFormPlugin from "../main";
import * as A from 'fp-ts/Array'
import { ItemView, Notice, Setting, WorkspaceLeaf } from "obsidian";
import { E, pipe } from "@std";

export const MANAGE_FORMS_VIEW = "modal-form-manage-forms-view";


/**
 * Manage existing forms and create new ones
 */
export class ManageFormsView extends ItemView {
    component!: ManageForms;
    constructor(readonly leaf: WorkspaceLeaf, readonly plugin: ModalFormPlugin) {
        super(leaf);
        this.icon = "documents";
    }

    getViewType() {
        return MANAGE_FORMS_VIEW;
    }

    getDisplayText() {
        return "Manage forms";
    }

    async onOpen() {
        // console.log('On open manage forms');
        const container = this.containerEl.children[1] || this.containerEl.createDiv();
        container.empty();

        const settings = await this.plugin.getSettings();
        const allForms = settings.formDefinitions;
        const { left: invalidForms, right: forms } = pipe(
            allForms,
            A.partitionMap((form) => {
                if (form instanceof MigrationError) {
                    return E.left(form);
                } else {
                    return E.right(form);
                }
            }));
        this.component = new ManageForms({
            target: container,
            props: {
                forms,
                invalidForms,
                createNewForm: () => {
                    this.plugin.createNewForm();
                },
                editForm: (formName: string) => {
                    this.plugin.editForm(formName);
                },
                deleteForm: (formName: string) => {
                    this.plugin.deleteForm(formName);
                },
                duplicateForm: (form: FormDefinition) => {
                    this.plugin.duplicateForm(form);
                }
            }
        })
        // container.createEl("h3", { text: "Manage forms" });
        // this.renderControls(container.createDiv());
        // await this.renderForms(container.createDiv());
    }

    renderControls(root: HTMLElement) {
        new Setting(root).addButton((button) => {
            button.setButtonText('Add new form').onClick(() => {
                this.plugin.createNewForm();
            })
        })
    }

    async renderForms(root: HTMLElement) {

        const settings = await this.plugin.getSettings();
        const forms = settings.formDefinitions;
        root.empty();
        const rows = root.createDiv();
        rows.setCssStyles({ display: 'flex', flexDirection: 'column', gap: '10px' });
        forms.forEach((form) => {
            if (form instanceof MigrationError) {
                return // TODO: UI for migration errors
            }
            const row = rows.createDiv()
            row.setCssStyles({ display: 'flex', flexDirection: 'column', gap: '8px' })
            row.createEl("h4", { text: form.name });
            new Setting(row)
                .setName(form.title)
                .then((setting) => {
                    // This moves the separator of the settings container from he top to the bottom
                    setting.settingEl.setCssStyles({ borderTop: 'none', borderBottom: '1px solid var(--background-modifier-border)' })
                })
                .addButton((button) => {
                    button.setButtonText("Delete").onClick(async () => {
                        await this.plugin.deleteForm(form.name);
                        this.renderForms(root);
                    });
                    button.setIcon('trash')
                    button.setClass('modal-form-danger')
                    button.setTooltip('delete form ' + form.name)
                }
                )
                .addButton((button) => {
                    button.setClass('modal-form-primary')
                    return button.setButtonText("Edit").onClick(async () => {
                        await this.plugin.editForm(form.name);
                    });
                }
                )
                .addButton((btn) => {
                    btn.setTooltip('duplicate ' + form.name)
                    btn.setButtonText('Duplicate').onClick(() => {
                        this.plugin.duplicateForm(form);
                    })
                })
                .addButton((button) => {
                    button.setIcon('clipboard-copy')
                    button.onClick(() => {
                        navigator.clipboard.writeText(JSON.stringify(form, null, 2));
                        new Notice("Form has been copied to the clipboard");
                    });
                })
                ;
        })
    }

    async onClose() {
        this.component.$destroy();
    }

}


