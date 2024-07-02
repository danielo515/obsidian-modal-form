import { input } from "@core";
import { A, O, absurd, pipe } from "@std";
import { FieldDefinition } from "src/core/formDefinition";
import { Readable, Writable, derived, writable } from "svelte/store";

export function buildCondition(
    conditionType: input.ConditionType,
    dependencyName: string,
    value: boolean | string | number,
): input.Condition {
    switch (conditionType) {
        case "isSet":
            return {
                dependencyName,
                type: "isSet",
            };
        case "boolean":
            return {
                dependencyName,
                type: "boolean",
                value: typeof value === "boolean" ? value : false,
            };
        case "startsWith":
        case "contains":
        case "endsWith":
        case "isExactly":
            return {
                dependencyName,
                type: conditionType,
                value: typeof value === "string" ? value : "",
            };
        case "above":
        case "below":
        case "aboveOrEqual":
        case "belowOrEqual":
        case "exactly":
            return {
                dependencyName,
                type: conditionType,
                value: typeof value === "number" ? value : 0,
            };
        default:
            return absurd(conditionType);
    }
}

export function getInitialInputValues(condition: input.Condition): {
    booleanValue: boolean;
    textValue: string;
    numberValue: number;
} {
    switch (condition.type) {
        case "isSet":
            return { booleanValue: false, textValue: "", numberValue: 0 };
        case "boolean":
            return { booleanValue: condition.value, textValue: "", numberValue: 0 };
        case "startsWith":
        case "contains":
        case "endsWith":
        case "isExactly":
            return { booleanValue: false, textValue: condition.value, numberValue: 0 };
        case "above":
        case "below":
        case "aboveOrEqual":
        case "belowOrEqual":
        case "exactly":
            return { booleanValue: false, textValue: "", numberValue: condition.value };
        default:
            return absurd(condition);
    }
}

const dummyLogger = { log: (...args: unknown[]) => {} };
const logger = dummyLogger;

export function makeModel(
    siblingFields: FieldDefinition[],
    condition: input.Condition,
    onChange: (condition: input.Condition) => void,
) {
    logger.log("model creation");
    function findSibling(dependencyName: string) {
        return pipe(
            siblingFields,
            A.findFirstMap((f) => (f.name === dependencyName ? O.of(f.input) : O.none)),
        );
    }
    const conditionStore = writable(condition);
    conditionStore.subscribe((c) => logger.log("condition", c));
    const dependencyNameStore = derived(conditionStore, ($condition) => $condition.dependencyName);
    function updateDependencyName(updater: (dependencyName: string) => string) {
        return conditionStore.update((c) => ({ ...c, dependencyName: updater(c.dependencyName) }));
    }
    function setDependencyName(dependencyName: string) {
        updateDependencyName(() => dependencyName);
    }
    const conditionTypeOptions: Readable<
        O.Option<ReturnType<typeof input.availableConditionsForInput>>
    > = derived(conditionStore, ($condition) =>
        pipe(
            //fuck prettier
            $condition.dependencyName,
            findSibling,
            O.map(input.availableConditionsForInput),
        ),
    );

    const valueField = derived(
        conditionStore,
        (
            $condition,
        ): O.Option<
            | {
                  readonly type: "dropdown";
                  readonly options: readonly [true, false];
                  readonly set: (val: boolean) => void;
              }
            | {
                  readonly type: "text";
                  readonly set: (val: string) => void;
              }
            | {
                  readonly type: "number";
                  readonly set: (val: number) => void;
              }
        > => {
            switch ($condition.type) {
                case "isSet":
                    return O.none;
                case "boolean":
                    return O.of({
                        type: "dropdown",
                        options: [true, false],
                        set: (val: boolean) => {
                            logger.log("setting boolean value", val);
                            onChange(
                                buildCondition($condition.type, $condition.dependencyName, val),
                            );
                        },
                    } as const);
                case "startsWith":
                case "contains":
                case "endsWith":
                case "isExactly":
                    return O.of({
                        type: "text",
                        set: (val: string) => {
                            logger.log("setting text value", val);
                            onChange(
                                buildCondition($condition.type, $condition.dependencyName, val),
                            );
                        },
                    } as const);
                case "above":
                case "below":
                case "aboveOrEqual":
                case "belowOrEqual":
                case "exactly":
                    return O.of({
                        type: "number",
                        set: (val: number) => {
                            logger.log("setting number value", val);
                            onChange(
                                buildCondition($condition.type, $condition.dependencyName, val),
                            );
                        },
                    } as const);
                default:
                    absurd($condition);
                    return O.none;
            }
        },
    );

    const dependencyName = {
        ...dependencyNameStore,
        set: setDependencyName,
        update: updateDependencyName,
    } satisfies Writable<string>;

    return {
        conditionTypeOptions,
        conditionType: {
            ...derived(conditionStore, ($condition) => $condition.type),
            set: (type: input.ConditionType) => {
                logger.log("setting condition type", type);
                conditionStore.update((c) => {
                    if (c.type === "isSet") return buildCondition(type, c.dependencyName, false);
                    return buildCondition(type, c.dependencyName, c.value);
                });
            },
        },
        dependencyName,
        valueField,
    };
}
