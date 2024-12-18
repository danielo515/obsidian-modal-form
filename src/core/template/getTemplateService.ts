import { App } from "obsidian";
import { Logger } from "src/utils/Logger";
import { BasicTemplateService } from "./BasicTemplateService";
import { TemplaterService } from "./TemplaterService";
import { TemplateService } from "./TemplateService";

export function getTemplateService(app: App, logger: Logger): TemplateService {
    const templaterApi = app.plugins.plugins["templater-obsidian"]?.templater;
    if (templaterApi) {
        logger.debug("Using Templater plugin for templates");
        return new TemplaterService(app, logger, templaterApi);
    }

    logger.debug("Using basic template service");
    return new BasicTemplateService(app, logger);
}
