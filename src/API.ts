import { App, parseFrontMatterAliases } from "obsidian";

import { type FormDefinition, type FormOptions } from "./core/formDefinition";
import { MigrationError } from "./core/formDefinitionSchema";
import FormResult from "./core/FormResult";
import { exampleModalDefinition } from "./exampleModalDefinition";
import ModalFormPlugin from "./main";
import { ModalFormError } from "./utils/ModalFormError";
import { FormModal } from "./FormModal";
import { log_error, log_notice } from "./utils/Log";
import * as std from "@std";
import { enrich_tfile, resolve_tfile } from "./utils/files";
import { E, flow } from "@std";

type pickOption = { pick: string[] };
type omitOption = { omit: string[] };
type limitOptions = { pick?: string[]; omit?: string[] };

function isPickOption(opts: limitOptions): opts is pickOption {
    return "pick" in opts && Array.isArray(opts.pick);
}
function isOmitOption(opts: limitOptions): opts is omitOption {
    return "omit" in opts && Array.isArray(opts.omit);
}

export class API {
    /**
     * What this plugin considers its standard library
     * Because it is bundled with the plugin anyway, I think
     * it makes sense to expose it to the user
     */
    std = std;
    util = {
        getAliases: flow(
            (name: string) => resolve_tfile(name, this.app),
            E.map((f) => this.app.metadataCache.getCache(f.path)),
            E.chainW(E.fromNullable(new Error("No cache found"))),
            E.map((tf) => parseFrontMatterAliases(tf.frontmatter)),
            E.match(
                () => [],
                (aliases) => aliases,
            ),
        ),
        getFile: std.flow(
            resolve_tfile,
            E.map((f) => enrich_tfile(f, this.app)),
        ),
    };
    /**
     * Constructor for the API class
     * @param {App} app - The application instance
     * @param {typeof ModalFormPlugin} plugin - The plugin instance
     */
    constructor(
        private app: App,
        private plugin: ModalFormPlugin,
    ) {}

    /**
     * Opens a modal form with the provided form definition
     * @param {FormDefinition} formDefinition - The form definition to use
     * @returns {Promise<FormResult>} - A promise that resolves with the form result
     */
    openModalForm(formDefinition: FormDefinition, options?: FormOptions): Promise<FormResult> {
        return new Promise((resolve) => {
            new FormModal(this.app, formDefinition, resolve, options).open();
        });
    }
    exampleForm(options?: FormOptions): Promise<FormResult> {
        return this.openModalForm(exampleModalDefinition, options);
    }

    private getFormByName(name: string): FormDefinition | undefined {
        const form = this.plugin.settings?.formDefinitions.find((form) => form.name === name);
        if (form instanceof MigrationError) {
            log_notice(
                "🚫 The form you tried to load has an invalid format",
                `The form "${name}" has an invalid format.` +
                    `We tried to automatically convert it but it failed, please fix it manually in the forms manager.
            `,
            );
            return undefined;
        } else {
            return form;
        }
    }

    /**
     * Opens a named form
     * @param {string} name - The name of the form to open
     * @returns {Promise<FormResult>} - A promise that resolves with the form result
     * @throws {ModalFormError} - Throws an error if the form definition is not found
     */
    public namedForm(name: string, options?: FormOptions): Promise<FormResult> {
        const formDefinition = this.getFormByName(name);
        if (formDefinition) {
            return this.openModalForm(formDefinition, options);
        } else {
            const error = new ModalFormError(`Form definition ${name} not found`);
            log_error(error);
            return Promise.reject(error);
        }
    }

    public limitedForm(name: string, opts: limitOptions): Promise<FormResult> {
        const formDefinition = this.getFormByName(name);
        let newFormDefinition: FormDefinition;
        if (formDefinition) {
            if (isOmitOption(opts)) {
                const omit = opts.omit;
                newFormDefinition = {
                    ...formDefinition,
                    fields: formDefinition.fields.filter((field) => !omit.includes(field.name)),
                };
            } else if (isPickOption(opts)) {
                newFormDefinition = {
                    ...formDefinition,
                    fields: formDefinition.fields.filter((field) => opts.pick.includes(field.name)),
                };
            } else {
                throw new ModalFormError(
                    "Invalid options provided to limitedForm",
                    `GOT: ${JSON.stringify(opts)}`,
                );
            }
            return this.openModalForm(newFormDefinition);
        } else {
            const error = new ModalFormError(`Form definition ${name} not found`);
            log_error(error);
            return Promise.reject(error);
        }
    }

    /**
     * Opens a form with the provided form reference
     * @param {string | FormDefinition} formReference - The form reference, either a form name of an existing form or an inline form definition
     * @returns {Promise<FormResult>} - A promise that resolves with the form result
     * @throws {ModalFormError} - Throws an error if the form reference is not found
     */
    public openForm(
        formReference: string | FormDefinition,
        options?: FormOptions,
    ): Promise<FormResult> {
        if (typeof formReference === "string") {
            return this.namedForm(formReference, options);
        } else {
            return this.openModalForm(formReference, options);
        }
    }
}
