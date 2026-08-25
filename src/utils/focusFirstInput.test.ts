import { INPUT_FOCUS_SELECTOR, focusFirstInput } from "./focusFirstInput";

describe("focusFirstInput", () => {
    it("targets the common text-like input types, textarea and select", () => {
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="text"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="number"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="email"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="tel"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="date"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="time"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="datetime-local"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="search"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="url"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain('input[type="password"]:not([disabled])');
        expect(INPUT_FOCUS_SELECTOR).toContain("textarea:not([disabled])");
        expect(INPUT_FOCUS_SELECTOR).toContain("select:not([disabled])");
    });

    it("does not target controls that should not be auto-focused", () => {
        // Buttons, toggles, sliders, files etc. should not be picked.
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="button"]');
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="submit"]');
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="checkbox"]');
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="radio"]');
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="file"]');
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="range"]');
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="color"]');
        expect(INPUT_FOCUS_SELECTOR).not.toContain('input[type="hidden"]');
    });

    it("focuses the first matching element when querySelector finds one", () => {
        const focusSpy = jest.fn();
        const element = { focus: focusSpy } as unknown as HTMLElement;
        const root = {
            querySelector: jest.fn().mockReturnValue(element),
        } as unknown as ParentNode;

        focusFirstInput(root);

        expect(root.querySelector).toHaveBeenCalledWith(INPUT_FOCUS_SELECTOR);
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it("is a no-op when no input is found", () => {
        const root = {
            querySelector: jest.fn().mockReturnValue(null),
        } as unknown as ParentNode;

        expect(() => focusFirstInput(root)).not.toThrow();
    });
});
