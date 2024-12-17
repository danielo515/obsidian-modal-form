import { TE } from "@std";
import { App } from "obsidian";
import { Logger } from "src/utils/Logger";
import { TemplateError } from "./TemplateError";
import { TemplateService } from "./TemplateService";

export interface TemplaterApi {
    create_new_note_from_template: (
        content: string,
        folder: string,
        title: string,
        openNewNote: boolean,
    ) => Promise<void>;
}

/**
 * Template service that uses the Templater plugin
 */
export class TemplaterService implements TemplateService {
    constructor(
        private app: App,
        private logger: Logger,
        private templaterApi: TemplaterApi,
    ) {}

    createNoteFromTemplate = (
        templateContent: string,
        targetFolder: string,
        filename: string,
        openNewNote: boolean,
    ): TE.TaskEither<TemplateError, void> =>
        TE.tryCatch(async () => {
            const title = filename;
            await this.templaterApi.create_new_note_from_template(
                templateContent,
                targetFolder,
                title,
                openNewNote,
            );
        }, TemplateError.of("Error creating note from template"));
}
