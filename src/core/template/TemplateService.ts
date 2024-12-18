import { TE } from "@std";
import { TemplateError } from "./TemplateError";

export interface TemplateService {
    /**
     * Creates a note from a template content
     */
    createNoteFromTemplate(
        templateContent: string,
        targetFolder: string,
        filename: string,
        openNewNote: boolean,
    ): TE.TaskEither<TemplateError, void>;
}
