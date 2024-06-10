import { AbstractInputSuggest, App, TFile, setIcon } from "obsidian";
import { enrich_tfile, get_tfiles_from_folder } from "../utils/files";
import { E, pipe, A } from "@std";
import Fuse from "fuse.js";

// Instead of hardcoding the logic in separate and almost identical classes,
// we move this little logic parts into an interface and we can use the samme
// input type and configure it to render file-like, note-like, or whatever we want.
export interface FileStrategy {
    renderSuggestion(file: TFile): string | DocumentFragment;
    selectSuggestion(file: TFile): string;
}

export class FileSuggest extends AbstractInputSuggest<TFile> {
    constructor(
        public app: App,
        public inputEl: HTMLInputElement,
        private strategy: FileStrategy,
        private folder: string,
    ) {
        super(app, inputEl);
    }

    getSuggestions(input_str: string): TFile[] {
        const all_files = pipe(
            get_tfiles_from_folder(this.folder, this.app),
            E.map(A.map((file) => enrich_tfile(file, this.app))),
        );
        if (E.isLeft(all_files)) {
            return [];
        }

        const lower_input_str = input_str.toLowerCase();
        if (input_str === "") return all_files.right;
        const fuse = new Fuse(all_files.right, {
            includeMatches: false,
            includeScore: true,
            shouldSort: true,
            keys: [
                { name: "name", weight: 3 },
                { name: "frontmatter.aliases", weight: 2 },
                { name: "path", weight: 1 },
                { name: "tags", weight: 1 }
            ],
        });
        return fuse.search(lower_input_str).map((result) => {
            //console.log(result);
            return result.item;
        });
    }

    /* This is an example structure of how a obsidian suggestion looks like in the dom
        <div class="suggestion">
            <div class="suggestion-item mod-complex is-selected">
                <div class="suggestion-content">
                    <div class="suggestion-title">
                        <span class="suggestion-highlight">Fátima</span>
                    </div>
                    <div class="suggestion-note">Fátima</div>
                </div>
                <div class="suggestion-aux">
                    <span class="suggestion-flair" aria-label="Alias">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-forward">
                            <polyline points="15 17 20 12 15 7"></polyline>
                            <path d="M4 18v-2a4 4 0 0 1 4-4h12"></path>
                        </svg>
                    </span>
                </div>
            </div>
        </div>
In the renderSuggestion the `el` is the suggestion-item div
*/
    renderSuggestion(file: TFile, el: HTMLElement): void {
        const text = this.strategy.renderSuggestion(file);
        el.addClasses(["mod-complex"]);
        const title = el.createDiv({ cls: "suggestion-title", text: text });
        const subtitle = el.createDiv({
            cls: "suggestion-note modal-form-suggestion",
            text: file.parent?.path,
        });
        const icon = el.createSpan({ cls: "suggestion-icon" });
        setIcon(icon, "folder");
        subtitle.prepend(icon);
        const body = el.createDiv({ cls: "suggestion-content" });
        body.appendChild(title);
        body.appendChild(subtitle);
        el.appendChild(body);
    }

    selectSuggestion(file: TFile): void {
        this.inputEl.value = this.strategy.selectSuggestion(file);
        this.inputEl.trigger("input");
        this.close();
    }
}
