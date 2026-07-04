import { A, pipe } from "@std";
import { absurd } from "fp-ts/function";
import { App } from "obsidian";
import {
    getMultiselectNoteFolders,
    inputTag,
    multiselect,
} from "src/core/input/InputDefinitionSchema";
import { executeSandboxedDvQuery, sandboxedDvQuery } from "src/suggesters/SafeDataviewQuery";
import { StringSuggest } from "src/suggesters/StringSuggest";
import { FileSuggest } from "src/suggesters/suggestFile";
import { Writable, get } from "svelte/store";

type FormData = Record<string, unknown>;

type MultiSelectModelOptions = {
    getFormData?: () => FormData;
};

export interface MultiSelectModel {
    createInput(element: HTMLInputElement): void;
    removeValue(value: string): void;
}

export function replaceRemainingOptions(
    remainingOptions: Set<string>,
    options: string[],
    selectedValues: string[],
): void {
    const selected = new Set(selectedValues);
    remainingOptions.clear();
    options
        .filter((option) => !selected.has(option))
        .forEach((option) => remainingOptions.add(option));
}

export async function MultiSelectModel(
    fieldInput: multiselect,
    app: App,
    values: Writable<string[]>,
    options: MultiSelectModelOptions = {},
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
        case "dataview": {
            const remainingOptions = new Set<string>();
            const query = sandboxedDvQuery(fieldInput.query);
            const refreshOptions = async () => {
                const results = await executeSandboxedDvQuery(
                    query,
                    app,
                    options.getFormData?.() ?? {},
                )();
                replaceRemainingOptions(remainingOptions, results, get(values) ?? []);
            };
            await refreshOptions();
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
                        refreshOptions,
                    );
                },
                removeValue(value: string) {
                    removeValue(value);
                    void refreshOptions();
                },
            };
        }
        case "fixed": {
            const remainingOptions = new Set(fieldInput.multi_select_options);
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
            const folders = getMultiselectNoteFolders(fieldInput);
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
                                values.update((x) =>
                                    x.includes(file.basename) ? x : [...x, file.basename],
                                );
                                return "";
                            },
                        },
                        folders,
                        () => get(values) ?? [],
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
