import type { App } from "obsidian";
import { AbstractInputSuggest } from "obsidian";

export interface Suggester<T> {
    getSuggestions(inputStr: string, options: T[]): T[];
    renderSuggestion(option: T, el: HTMLElement): void;
    selectSuggestion(option: T): string;
}

/**
 * A generic suggester that can be used with any type of content
 * as long as you provide a strategy to get suggestions, render them and select one.
 * It abstracts the obsidian OOP abstract input suggester, so you can do it
 * in a more functional way.
 */
export class GenericSuggest<T> extends AbstractInputSuggest<T> {
    content: Set<T>;

    constructor(app: App, private inputEl: HTMLInputElement, content: Set<T>, private strategy: Suggester<T>) {
        super(app, inputEl);
        this.content = content;
    }

    getSuggestions(inputStr: string): T[] {
        const lowerCaseInputStr = inputStr.toLowerCase();
        return this.strategy.getSuggestions(lowerCaseInputStr, [...this.content])
    }

    renderSuggestion(content: T, el: HTMLElement): void {
        return this.strategy.renderSuggestion(content, el);
    }

    selectSuggestion(value: T): void {
        this.inputEl.value = this.strategy.selectSuggestion(value);
        this.inputEl.trigger("input");
        this.close();
    }
}
