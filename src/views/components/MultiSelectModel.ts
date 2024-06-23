import { A, pipe } from "@std";
import { absurd } from "fp-ts/function";
import { App } from "obsidian";
import { inputTag, multiselect } from "src/core/input/InputDefinitionSchema";
import { executeSandboxedDvQuery, sandboxedDvQuery } from "src/suggesters/SafeDataviewQuery";
import { StringSuggest } from "src/suggesters/StringSuggest";
import { FileSuggest } from "src/suggesters/suggestFile";
import { Writable } from "svelte/store";

export interface MultiSelectModel {
    createInput(element: HTMLInputElement): void;
    removeValue(value: string): void;
}

export async function MultiSelectModel(
    fieldInput: multiselect,
    app: App,
    values: Writable<string[]>,
): Promise<MultiSelectModel> {
    const source = fieldInput.source;
    const removeValue = (value: string) =>
        values.update((xs) =>
            pipe(
                xs,
                A.filter((x) => x !== value),
            ),
        );
    switch (source) {
        case "dataview":
        case "fixed": {
            const remainingOptions = new Set(
                source === "fixed"
                    ? fieldInput.multi_select_options
                    : await executeSandboxedDvQuery(sandboxedDvQuery(fieldInput.query), app)(),
            );
            return {
                createInput(element: HTMLInputElement) {
                    new StringSuggest(
                        element,
                        remainingOptions,
                        (selected) => {
                            remainingOptions.delete(selected);
                            values.update((x) => [...x, selected]);
                        },
                        app,
                        fieldInput.allowUnknownValues,
                    );
                },
                removeValue(value: string) {
                    remainingOptions.add(value);
                    removeValue(value);
                },
            };
        }
        case "notes": {
            return {
                createInput(element: HTMLInputElement) {
                    new FileSuggest(
                        app,
                        element,
                        {
                            renderSuggestion(file) {
                                return file.basename;
                            },
                            selectSuggestion(file) {
                                values.update((x) => [...x, file.basename]);
                                return "";
                            },
                        },
                        fieldInput.folder,
                    );
                },
                removeValue,
            };
        }
        default:
            return absurd(source);
    }
}

export function MultiSelectTags(
    fieldInput: inputTag,
    app: App,
    values: Writable<string[] | undefined>,
): MultiSelectModel {
    const remainingOptions = new Set(
        Object.keys(app.metadataCache.getTags()).map(
            (tag) => tag.slice(1) /** remove the leading # */,
        ),
    );
    return {
        createInput(element: HTMLInputElement) {
            new StringSuggest(
                element,
                remainingOptions,
                (selected) => {
                    remainingOptions.delete(selected);
                    values.update((x) => {
                        console.log(x);
                        return x == undefined ? [selected] : [...x, selected];
                    });
                },
                app,
                true,
            );
        },
        removeValue(value: string) {
            remainingOptions.add(value);
            values.update((x) =>
                pipe(
                    x || [],
                    A.filter((x) => x !== value),
                ),
            );
        },
    };
}
