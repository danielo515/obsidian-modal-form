import { App, FuzzySuggestModal } from "obsidian";
import { FormDefinition } from "src/core/formDefinition";

export class FormPickerModal<Definition extends FormDefinition> extends FuzzySuggestModal<Definition> {
    constructor(app: App, protected forms: Definition[], protected onSelected: (form: Definition) => void) {
        super(app);
    }

    getItems(): Definition[] {
        return this.forms;
    }

    getItemText(item: Definition): string {
        return item.title;
    }

    onChooseItem(item: Definition, _: MouseEvent | KeyboardEvent): void {
        this.close();
        this.onSelected(item);
    }
}
