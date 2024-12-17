import { TE } from "@std";
import { App, normalizePath } from "obsidian";
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
        template: string,
        targetPath: string,
    ): TE.TaskEither<TemplateError, void> =>
        TE.tryCatch(
            async () => {
                await this.app.vault.create(normalizePath(targetPath), template);
            },
            TemplateError.of("Error creating note from template"),
        );
}
