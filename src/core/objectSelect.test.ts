import { objectSelect } from "./objectSelect";

describe("objectSelect", () => {
    const obj = {
        name: "John Doe",
        age: 30,
        hobbies: ["reading", "swimming"],
        isEmployed: true,
    };

    it("should return the original object if no options are provided", () => {
        expect(objectSelect(obj, {})).toEqual(obj);
    });

    it("should pick the specified properties from the object", () => {
        const opts = { pick: ["name", "age"] };
        const expectedOutput = { name: "John Doe", age: 30 };
        expect(objectSelect(obj, opts)).toEqual(expectedOutput);
    });

    it("should omit the specified properties from the object", () => {
        const opts = { omit: ["name", "hobbies"] };
        const expectedOutput = { age: 30, isEmployed: true };
        expect(objectSelect(obj, opts)).toEqual(expectedOutput);
    });

    it("should pick and omit properties from the object", () => {
        const opts = { pick: ["name", "age"], omit: ["age"] };
        const expectedOutput = { name: "John Doe" };
        expect(objectSelect(obj, opts)).toEqual(expectedOutput);
    });

    it("should return the original object if the pick array is empty", () => {
        const opts = { pick: [] };
        expect(objectSelect(obj, opts)).toEqual(obj);
    });

    it("should return an empty object if the omit array contains all properties", () => {
        const opts = { omit: ["name", "age", "hobbies", "isEmployed"] };
        expect(objectSelect(obj, opts)).toEqual({});
    });

    it("should return the original object if the omit array is empty", () => {
        const opts = { omit: [] };
        expect(objectSelect(obj, opts)).toEqual(obj);
    });

    it("should return the original object if the options argument is not an object", () => {
        expect(objectSelect(obj, "invalid options")).toEqual(obj);
    });

    it("should return the original object if the options argument is null", () => {
        expect(objectSelect(obj, null)).toEqual(obj);
    });

    it("should return the original object if the options argument is undefined", () => {
        expect(objectSelect(obj, undefined)).toEqual(obj);
    });
});
