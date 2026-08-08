import { debounce } from "./index";

describe("debounce", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("runs only the last call of a burst", () => {
        const spy = jest.fn();
        const debounced = debounce(spy, 100);
        debounced("a");
        debounced("b");
        debounced("c");
        expect(spy).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith("c");
    });

    it("flush runs the pending call right away", () => {
        const spy = jest.fn();
        const debounced = debounce(spy, 100);
        debounced("a");
        debounced.flush();
        expect(spy).toHaveBeenCalledWith("a");
        jest.advanceTimersByTime(1000);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("flush does nothing when there is nothing pending", () => {
        const spy = jest.fn();
        const debounced = debounce(spy, 100);
        debounced.flush();
        expect(spy).not.toHaveBeenCalled();
    });

    it("cancel forgets the pending call", () => {
        const spy = jest.fn();
        const debounced = debounce(spy, 100);
        debounced("a");
        debounced.cancel();
        jest.advanceTimersByTime(1000);
        expect(spy).not.toHaveBeenCalled();
    });
});
