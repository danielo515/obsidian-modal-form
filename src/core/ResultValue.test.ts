import { ResultValue } from "./ResultValue";
jest.mock('src/utils/Log')

const notifyMock = (str: string) => jest.fn().mockReturnValue(str)
describe("ResultValue", () => {
    describe("map", () => {
        it("should apply the provided function to the value and return a new ResultValue", () => {
            // Arrange
            const value = 42;
            const resultValue = ResultValue.from(value, "Test", notifyMock);

            // Act
            const mappedResultValue = resultValue.map((v) => v * 2);

            // Assert
            expect(mappedResultValue.toString()).toEqual('84');
        });

        it("should handle errors thrown by the provided function and return an unchanged ResultValue", () => {
            // Arrange
            const value = 42;
            const resultValue = ResultValue.from(value, "Test", notifyMock);

            // Act
            const mappedResultValue = resultValue.map(() => {
                throw new Error("Something went wrong");
            });

            // Assert
            expect(mappedResultValue).toEqual(resultValue);
        });

        it("should notify an error and return an unchanged ResultValue if an error occurs during mapping", () => {
            // Arrange
            const value = 42;
            const resultValue = ResultValue.from(value, "Test", notifyMock);

            // Act
            const mappedResultValue = resultValue.map(() => {
                throw new Error("Something went wrong");
            });

            // Assert
            expect(mappedResultValue).toEqual(resultValue);
        });
    });


    describe("toBulletList", () => {
        it("should return a bullet list item for boolean values", () => {
            // Arrange
            const value = true;
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const bulletList = resultValue.toBulletList();

            // Assert
            expect(bulletList).toEqual("- true");
        });

        it("should return a bullet list item for number values", () => {
            // Arrange
            const value = 42;
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const bulletList = resultValue.toBulletList();

            // Assert
            expect(bulletList).toEqual("- 42");
        });

        it("should return a bullet list item for string values", () => {
            // Arrange
            const value = "Test";
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const bulletList = resultValue.toBulletList();

            // Assert
            expect(bulletList).toEqual("- Test");
        });

        it("should return a bullet list item for array values", () => {
            // Arrange
            const value = [1, 2, 3];
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const bulletList = resultValue.toBulletList();
            const shortHand = resultValue.bullets;

            // Assert
            expect(bulletList).toEqual("- 1\n- 2\n- 3");
            expect(shortHand).toEqual("- 1\n- 2\n- 3");
        });

        it("should return a bullet list item for object values", () => {
            // Arrange
            const value = { name: "John", age: 30 };
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const bulletList = resultValue.toBulletList();

            // Assert
            expect(bulletList).toEqual("- name: John\n- age: 30");
        });

        it("should return an empty string for unsupported value types", () => {
            // Arrange
            const value = null;
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const bulletList = resultValue.toBulletList();

            // Assert
            expect(bulletList).toEqual("");
        });
    });
});
