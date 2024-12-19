import { E, pipe, TE } from "@std";
import { App, TFile } from "obsidian";
import { resolve_tfile } from "src/utils/files";
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
    overwrite_file_commands: (file: TFile, active_file?: boolean) => Promise<void>;
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
        TE.tryCatch(
            async () => {
                const title = filename;
                const result = await this.templaterApi.create_new_note_from_template(
                    templateContent,
                    targetFolder,
                    title,
                    openNewNote,
                );
                if (result === undefined) {
                    throw new Error("Templater API returned undefined, probably a parsing error");
                }
            },
            (e) =>
                e instanceof Error
                    ? TemplateError.of(e.message)(e)
                    : TemplateError.of("Unknown error")(e),
        );

    replaceVariablesInFile = (filePath: string): TE.TaskEither<TemplateError, void> => {
        return pipe(
            resolve_tfile(filePath, this.app),
            E.mapLeft(TemplateError.of("Error resolving file")),
            TE.fromEither,
            TE.chain((file) =>
                TE.tryCatch(
                    () => this.templaterApi.overwrite_file_commands(file, true),
                    (e) => {
                        this.logger.error("Error while replacing variables in file", e);
                        return TemplateError.of("Error replacing variables in file")(e);
                    },
                ),
            ),
        );
    };
}
