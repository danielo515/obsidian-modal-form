import { App, Modal, Setting } from "obsidian";
import { FormWithTemplate } from "src/core/formDefinition";
import { FolderSuggest } from "./suggestFolder";
import { GenericSuggest } from "./suggestGeneric";
import { log_notice } from "src/utils/Log";

interface OnSelectArgs {
    form: FormWithTemplate
    folder: string
    noteName: string
}

const formSuggester = (app: App, input: HTMLInputElement, forms: FormWithTemplate[], onChange: (form: FormWithTemplate) => void) => new GenericSuggest<FormWithTemplate>(
    app,
    input,
    new Set(forms),
    {
        getSuggestions: (inputStr, forms) => {
            return forms.filter((form) => form.name.toLowerCase().contains(inputStr))
        },
        renderSuggestion: (form, el) => {
            el.setText(form.name)
        },
        selectSuggestion: (form) => {
            onChange(form)
            return form.name
        }
    }
)

export class NewNoteModal extends Modal {
    constructor(app: App, private forms: FormWithTemplate[], protected onSelected: (args: OnSelectArgs) => void) {
        super(app);
    }

    onOpen() {
        let destinationFolder = ''
        let form: FormWithTemplate
        let noteName = ''
        const { contentEl } = this;
        // h1 is a title
        contentEl.createEl('h1', { text: 'New Note from form' })

        // picker of existing forms
        new Setting(contentEl).addSearch((element) => {
            formSuggester(this.app, element.inputEl, this.forms, (value) => {
                form = value
            })
        }).setDesc('Pick a form')
        // picker for destination folder
        new Setting(contentEl).addSearch((element) => {
            new FolderSuggest(element.inputEl, this.app)
            element.onChange((value) => {
                destinationFolder = value
            })
        }).setName('Destination folder')
        new Setting(contentEl).addText((element) => {
            element.onChange((value) => {
                noteName = value
            })
        }).setName('Note name');
        // button to create new form
        new Setting(contentEl).addButton((element) => {
            element.setButtonText('Create new note')
            element.onClick(() => {
                if (!form || !destinationFolder.trim() || !noteName.trim()) {
                    log_notice('Missing fields', 'Please fill all the fields')
                    return
                }
                this.close()
                this.onSelected({
                    form,
                    folder: destinationFolder.trim(),
                    noteName: noteName.trim(),
                })
            })
        })
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
