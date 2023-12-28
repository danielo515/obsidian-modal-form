# Managing Results

The `FormResult` class provides methods for managing form results.

## `asFrontmatterString(options?: unknown): string`

Transforms the current data into a frontmatter string, which is expected to be enclosed in `---` when used in a markdown file. This method does not add the enclosing `---` to the string, so you can put it anywhere inside the frontmatter.

### Parameters

-   `options` (optional): An options object describing what options to pick or omit.

    -   `pick` (optional): An array of key names to pick from the data.
    -   `omit` (optional): An array of key names to omit from the data.

### Returns

-   `string`: The data formatted as a frontmatter string.

### Example

```typescript
const result = await form.openForm("my-form");
tR += result.asFrontmatterString({ pick: ["title"] });
```

### Aliases

this method has the following aliases:

-   `asFrontmatter`
-   `asYaml`

## `asDataviewProperties(options?: unknown): string`

Returns the current data as a block of dataview properties.

### Parameters

-   `options` (optional): An options object describing what options to pick or omit.

    -   `pick` (optional): An array of key names to pick from the data.
    -   `omit` (optional): An array of key names to omit from the data.

### Returns

-   `string`: The data formatted as a block of dataview properties.

### Example

```typescript
const result = await form.openForm('my-form')
tR += result.asDataviewProperties({ pick: ['title'] });`
```

### Aliases

This method has the following aliases:

-   `asDataview`
-   `asDv`

## `get(key: string, mapFn?: (value: any) => any): any`

Returns the value of the given key.
If the key does not exist, returns the empty string `""`.
It takes an optional map function that can be used to transform the value.
If the key does not exist, the map function is not called.

### Parameters

-   `key`: The key to get the value of.
-   `mapFn` (optional): A function that takes the value and returns a new value.

### Returns

-   `any`: The value of the given key.

### Example

```typescript
const result = await form.openForm("my-form");
tR += result.get("title");
```

Or with a map function:

```typescript
const result = await form.openForm("my-form");
tR += result.get("title", (value) => value.toUpperCase());
```

## `getValue(key: string): ResultValue` or `getV(key: string): ResultValue`

Returns the value of the given key as a [`ResultValue`](ResultValue.md) object.

### Parameters
-  `key`: The key to get the value of.

### Returns
-  `ResultValue`: The value of the given key as a [`ResultValue`](ResultValue.md) object. 
If the key field doesn't exist oor is empty, returns an empty [`ResultValue`](ResultValue.md) object. Thanks to this, you don't need to check if the field exists or is empty because the [`ResultValue`](ResultValue.md) object will handle it for you.
