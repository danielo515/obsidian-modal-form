import { TE } from "@std";
import { TemplateError } from "./TemplateError";

export interface TemplateService {
    /**
     * Creates a note from a template content
     * @param template The template content
     * @param targetPath Path where the new note should be created
     */
    createNoteFromTemplate(
        templateContent: string,
        targetFolder: string,
        filename: string,
        openNewNote: boolean,
    ): TE.TaskEither<TemplateError, void>;
}
