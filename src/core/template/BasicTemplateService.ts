import { TE } from "@std";
import { constVoid } from "fp-ts/function";
import { App, normalizePath, TFile } from "obsidian";
import { Logger } from "src/utils/Logger";
import { TemplateError } from "./TemplateError";
import { TemplateService } from "./TemplateService";

/**
 * Basic template service that creates notes with unchanged content
 */
export class BasicTemplateService implements TemplateService {
    constructor(
        private app: App,
        private logger: Logger,
    ) {}

    createNoteFromTemplate = (
        templateContent: string,
        targetFolder: string,
        filename: string,
        openNewNote: boolean,
    ): TE.TaskEither<TemplateError, void> =>
        TE.tryCatch(async () => {
            const fullPath = normalizePath(`${targetFolder}/${filename}.md`);
            await this.app.vault.create(fullPath, templateContent);
            if (openNewNote) {
                const file = this.app.vault.getAbstractFileByPath(fullPath);
                if (!file) {
                    this.logger.error("File not found", fullPath);
                    return;
                }
                if (file instanceof TFile) {
                    await this.app.workspace.getLeaf("split").openFile(file);
                }
            }
        }, TemplateError.of("Error creating note from template"));

    replaceVariablesInFile = (filePath: string): TE.TaskEither<TemplateError, void> => {
        this.logger.debug("Replacing variables in file without templater does nothing", filePath);
        return TE.of(constVoid());
    };
}
