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

        it("should be possible to chain multiple maps", () => {
            // Arrange
            const value = 42;
            const resultValue = ResultValue.from(value, "Test", notifyMock);

            // Act
            const mappedResultValue = resultValue
                .map((v) => v * 2)
                .map((v) => v + 1);

            // Assert
            expect(mappedResultValue.toString()).toEqual('85');
        });
        it("should be possible to map and then format the value", () => {
            // Arrange
            const value = ['foo', 'bar'];
            const resultValue = ResultValue.from(value, "Test", notifyMock);

            // Act
            const mappedResultValue = resultValue
                .map((v) => v.map((it) => it.toUpperCase()))
                .bullets;

            // Assert
            expect(mappedResultValue.toString()).toEqual('- FOO\n- BAR');
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
    describe("upper", () => {
        it("should convert the value to uppercase", () => {
            // Arrange
            const value = "test";
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const upper = resultValue.upper;

            // Assert
            expect(upper.toString()).toEqual("TEST");
        });
        it("should convert an array of values to uppercase", () => {
            // Arrange
            const value = ["foo", "bar"];
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const upper = resultValue.upper;

            // Assert
            expect(upper.toString()).toEqual("FOO, BAR");
        });
        it('upper strings and numbers mixed', () => {
            // Arrange
            const value = ["foo", 42];
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const upper = resultValue.upper;

            // Assert
            expect(upper.bullets).toEqual('- FOO\n- 42');
        })
        it('upper should be chainable', () => {
            // Arrange
            const value = "test";
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const upper = resultValue.upper.upper;

            // Assert
            expect(upper.toString()).toEqual("TEST");
        });
    });
    describe("lower", () => {
        it("should convert the value to lowercase", () => {
            // Arrange
            const value = "TEST";
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const lower = resultValue.lower;

            // Assert
            expect(lower.toString()).toEqual("test");
        });
        it("should convert an array of values to lowercase", () => {
            // Arrange
            const value = ["FOO", "BAR"];
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const lower = resultValue.lower;

            // Assert
            expect(lower.toString()).toEqual("foo, bar");
        });
        it('lower strings and numbers mixed', () => {
            // Arrange
            const value = ["FOO", 42];
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const lower = resultValue.lower;

            // Assert
            expect(lower.bullets).toEqual('- foo\n- 42');
        })
        it('lower should be chainable', () => {
            // Arrange
            const value = "TEST";
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const lower = resultValue.lower.lower;

            // Assert
            expect(lower.toString()).toEqual("test");
        });
    });
    describe("trimmed", () => {
        it("should trim the value", () => {
            // Arrange
            const value = " test ";
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const trimmed = resultValue.trimmed;

            // Assert
            expect(trimmed.toString()).toEqual("test");
        });
        it("should trim an array of values", () => {
            // Arrange
            const value = [" foo ", " bar "];
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const trimmed = resultValue.trimmed;

            // Assert
            expect(trimmed.toString()).toEqual("foo, bar");
        });
        it('trimmed strings and numbers mixed', () => {
            // Arrange
            const value = [" foo ", 42];
            const resultValue = ResultValue.from(value, "Test");

            // Act
            const trimmed = resultValue.trimmed;

            // Assert
            expect(trimmed.bullets).toEqual('- foo\n- 42');
        })
        it('trimmed should be chainable', () => {
            // Arrange
            const value = " test ";
            const resultValue = ResultValue.from(value, "Test");
            // Act
            const trimmed = resultValue.trimmed.trimmed;
            // Assert
            expect(trimmed.toString()).toEqual("test");
        });
    })
    describe("chaining shortcuts", () => {
        it("should be possible to chain upper, lower and trim", () => {
            // Arrange
            const value = " TeSt ";
            const resultValue = ResultValue.from(value, "Test");
            // Act
            const trimmed = resultValue.trimmed.upper.lower;
            // Assert
            expect(trimmed.toString()).toEqual("test");
        });
        it('should be possible to chain shortcuts with other format methods', () => {
            const value = [" TeSt ", 'foo ', 55];
            const resultValue = ResultValue.from(value, "Test");
            const final = resultValue.trimmed.upper.lower;
            expect(final.bullets).toEqual('- test\n- foo\n- 55');
        });
    });
});
