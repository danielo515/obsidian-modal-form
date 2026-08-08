jest.mock("obsidian");
import { App } from "obsidian";
import { Logger } from "src/utils/Logger";
import { BasicTemplateService } from "./BasicTemplateService";
import { getTemplateService, makeTemplateServiceResolver } from "./getTemplateService";
import { TemplaterApi, TemplaterService } from "./TemplaterService";

const logger = Logger.getInstance();

const templaterApi: TemplaterApi = {
    create_new_note_from_template: jest.fn(),
    overwrite_file_commands: jest.fn(),
};

/**
 * Minimal app stub exposing only what the resolver reads.
 * `templater` starts undefined, mimicking Templater not being loaded yet.
 */
function makeApp(): App & { loadTemplater: () => void } {
    const plugins: Record<string, unknown> = {};
    const app = {
        plugins: { enabledPlugins: new Set<string>(), plugins },
        loadTemplater() {
            plugins["templater-obsidian"] = { templater: templaterApi };
        },
    };
    return app as unknown as App & { loadTemplater: () => void };
}

describe("getTemplateService", () => {
    it("returns the basic service when Templater is not available", () => {
        expect(getTemplateService(makeApp(), logger)).toBeInstanceOf(BasicTemplateService);
    });

    it("returns the Templater service when Templater is available", () => {
        const app = makeApp();
        app.loadTemplater();
        expect(getTemplateService(app, logger)).toBeInstanceOf(TemplaterService);
    });
});

describe("makeTemplateServiceResolver", () => {
    it("picks up Templater when it loads after the resolver was created", () => {
        const app = makeApp();
        const resolve = makeTemplateServiceResolver(app, logger);

        // Templater has not exposed its API yet, we can only offer the basic service
        expect(resolve()).toBeInstanceOf(BasicTemplateService);

        app.loadTemplater();

        expect(resolve()).toBeInstanceOf(TemplaterService);
    });

    it("caches the Templater service once resolved", () => {
        const app = makeApp();
        app.loadTemplater();
        const resolve = makeTemplateServiceResolver(app, logger);

        expect(resolve()).toBe(resolve());
    });
});
