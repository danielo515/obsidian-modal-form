import { App, Modal, Setting } from "obsidian";
import { FormWithTemplate } from "src/core/formDefinition";
import { FolderSuggest } from "./suggestFolder";
import { GenericSuggest } from "./suggestGeneric";
import { log_notice } from "src/utils/Log";
import { pipe } from "fp-ts/function";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";

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

/**
 * A modal to select a form, a destination folder and a name 
 * to create a new note from a form
 * @param app the obsidian app
 * @param forms the list of forms that have a template
 * @param onSelected the callback to call when the user completes the selection
 * @returns the modal instance
 * @category UI
 * */
export class NewNoteModal extends Modal {
    constructor(app: App, private forms: FormWithTemplate[], protected onSelected: (args: OnSelectArgs) => void) {
        super(app);
    }

    onOpen() {
        let destinationFolder = '';
        let noteName = '';
        let formSelection: FormWithTemplate | undefined;
        const { contentEl } = this;
        
        // h1 is a title
        contentEl.createEl('h1', { text: 'New Note from form' });
        
        // Handle form selection based on number of available forms
        if (this.forms.length === 1) {
            // If only one form is available, use it directly without showing a picker
            // Use fp-ts to safely get the first element
            pipe(
                this.forms,
                A.head,
                O.fold(
                    () => { /* This should never happen since we checked length === 1 */ },
                    (form) => {
                        formSelection = form;
                        // Show which form is being used
                        const formInfoEl = contentEl.createEl('div', { 
                            text: `Using form: ${form.name}`,
                            cls: 'modal-form-selected-form'
                        });
                        
                        // Add padding to the form info element
                        formInfoEl.style.padding = '10px';
                        formInfoEl.style.marginBottom = '15px';
                    }
                )
            );
        } else {
            // If multiple forms are available, show a picker
            new Setting(contentEl)
                .setDesc('Pick a form')
                .addSearch((element) => {
                    formSuggester(this.app, element.inputEl, this.forms, (value) => {
                        formSelection = value;
                    });
                });
        }
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
                if (!formSelection || !destinationFolder.trim() || !noteName.trim()) {
                    log_notice('Missing fields', 'Please fill all the fields')
                    return
                }
                this.close()
                this.onSelected({
                    form: formSelection,
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
