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

/**
 * Builds a resolver that returns the template service to use at the moment it is called.
 *
 * Resolving the service eagerly (for example, when our plugin loads) is not reliable:
 * Obsidian enables plugins in the order they appear in `community-plugins.json`, and
 * Templater only exposes its API partway through its own `onload`. If we happen to load
 * first we would see no Templater and silently fall back to the basic service for the
 * rest of the session, leaving templater syntax unprocessed in every template.
 *
 * By resolving lazily we pick Templater up as soon as it becomes available. Once we get
 * a Templater backed service we cache it, since Templater cannot disappear without a
 * plugin reload, but we keep re-checking while we only have the basic fallback.
 */
export function makeTemplateServiceResolver(app: App, logger: Logger): () => TemplateService {
    let templaterService: TemplateService | undefined;
    return () => {
        if (templaterService !== undefined) {
            return templaterService;
        }
        const service = getTemplateService(app, logger);
        if (service instanceof TemplaterService) {
            templaterService = service;
        }
        return service;
    };
}
