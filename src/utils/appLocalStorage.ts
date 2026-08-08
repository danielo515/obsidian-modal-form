import { App } from "obsidian";
import type { DraftStorage } from "src/core/formDrafts";
import type { Logger } from "./Logger";

/**
 * Obsidian exposes a vault scoped local storage through `App.loadLocalStorage`
 * and `App.saveLocalStorage`. It is the intended place for data that is
 * disposable, machine local and not worth putting in `data.json`, which is
 * exactly what an in-progress form is.
 *
 * Those methods only exist since Obsidian 1.5, and our declared minimum app
 * version is older than that, so we feature detect them and fall back to
 * `window.localStorage` using the same key shape Obsidian itself uses.
 */
export function appLocalStorage(app: App, key: string, logger: Logger): DraftStorage {
    const fallbackKey = `${app.appId ?? "modal-form"}-${key}`;
    return {
        load() {
            try {
                if (typeof app.loadLocalStorage === "function") {
                    return app.loadLocalStorage(key);
                }
                const raw = window.localStorage.getItem(fallbackKey);
                return raw === null ? null : JSON.parse(raw);
            } catch (error) {
                logger.error("Could not read local storage", key, error);
                return null;
            }
        },
        save(value) {
            try {
                if (typeof app.saveLocalStorage === "function") {
                    app.saveLocalStorage(key, value);
                    return;
                }
                if (value === null) {
                    window.localStorage.removeItem(fallbackKey);
                } else {
                    window.localStorage.setItem(fallbackKey, JSON.stringify(value));
                }
            } catch (error) {
                logger.error("Could not write local storage", key, error);
            }
        },
    };
}
