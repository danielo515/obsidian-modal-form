// https://github.com/blacksmithgu/obsidian-dataview/blob/bb594a27ba1eed130d7c2ab7eff0990578e93f62/src/typings/obsidian-ex.d.ts
import type { DataviewApi } from "api/plugin-api";
import "obsidian";
import type { PublicAPI } from "src/main";

declare module "obsidian" {
    interface MetadataCache {
        trigger(...args: Parameters<MetadataCache["on"]>): void;
        trigger(name: string, ...data: unknown[]): void;
        getTags(): Record<string, number>;
    }

    interface App {
        appId?: string;
        plugins: {
            enabledPlugins: Set<string>;
            plugins: {
                dataview?: {
                    api: DataviewApi;
                };
            };
        };
    }

    interface Workspace {
        /** Sent to rendered dataview components to tell them to possibly refresh */
        on(
            name: "dataview:refresh-views",
            callback: () => void,
            ctx?: unknown,
        ): EventRef;
    }
}

declare global {
    interface Window {
        DataviewAPI?: DataviewApi;
        MF?: PublicAPI;
        ModalForm?: PublicAPI;
    }
}
