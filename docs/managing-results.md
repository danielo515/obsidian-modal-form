# Managing Results

The `FormResult` class provides methods for managing form results.

## `asFrontmatterString(options?: unknown): string`

Transforms the current data into a frontmatter string, which is expected to be enclosed in `---` when used in a markdown file. This method does not add the enclosing `---` to the string, so you can put it anywhere inside the frontmatter.

### Parameters

- `options` (optional): An options object describing what options to pick or omit.

  - `pick` (optional): An array of key names to pick from the data.
  - `omit` (optional): An array of key names to omit from the data.

### Returns

- `string`: The data formatted as a frontmatter string.

### Example

```typescript
const result = await form.openForm('my-form')
tR += result.asFrontmatterString({ pick: ['title'] });
```

## `asDataviewProperties(options?: unknown): string`

Returns the current data as a block of dataview properties.

### Parameters

- `options` (optional): An options object describing what options to pick or omit.

    - `pick` (optional): An array of key names to pick from the data.
    - `omit` (optional): An array of key names to omit from the data.

### Returns

- `string`: The data formatted as a block of dataview properties.

### Example

```typescript
const result = await form.openForm('my-form')
tR += result.asDataviewProperties({ pick: ['title'] });`
