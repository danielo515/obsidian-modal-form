import * as v from "valibot";
const isSet = v.object({ field: v.string(), type: v.literal("isSet") });
const booleanValue = v.object({
    field: v.string(),
    type: v.literal("boolean"),
    value: v.boolean(),
});
const startsWith = v.object({
    field: v.string(),
    type: v.literal("startsWith"),
    value: v.string(),
});
const above = v.object({ field: v.string(), type: v.literal("above"), value: v.number() });
const below = v.object({ field: v.string(), type: v.literal("below"), value: v.number() });
const condition = v.union([isSet, booleanValue, startsWith, above, below]);

export type Condition = v.Output<typeof condition>;
