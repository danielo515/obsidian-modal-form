
# ResultValue

This class is a helper wrapper for values coming from a form Result.
It provides a safer and convenient interface to render the contained value in various formats. 
The main purpose is to avoid the need to check for null or undefined values while having a convenient interface to print the value in a template.

## Usage

All the following examples assume that the form has been opened with the following templater code:

```typescript
<%* const result = await forms.openForm('myForm'); %>
```

### Render/printing as string

By default, the value is rendered as a string. If the value is null or undefined, an empty string is returned.
You don't need to call or do anything special to render the value as a string, just use it as if it was a string.


```typescript
<% result.getValue('firstField') %>
```

if the value of the field is "Hello World", the above code will print "Hello World" in the resulting note.
However, if the value is null or undefined, nothing will be printed.

### Render/printing as bullet list

You can render any value as a bullet list by using the `toBulletList()` method.
If the value is an array, each element of the array will be printed as a bullet point.
If the value is a primitive, like a number or a string, it will be printed as a single bullet point.
If the value is null or undefined, an empty string is printed.

```typescript
<% result.getValue('listField').toBulletList() %>
```

You can also use a shorthand for this method by using the `bullets` property:

```typescript
<% result.getValue('listField').bullets %>
```

The above code is equivalent to the previous one.

If the value of the field is `["Hello", "World"]`, the above code will print:

```markdown
- Hello
- World
```

### Render/printing as dataview field

You can render any value as a dataview field by using the `toDataviewField()` method or the shorthand `toDv()` alias.

List values are rendered as a dataview list field, while primitive values are just rendered as a dataview field.

```typescript
<% result.getValue('listField').toDataviewField() %>
Or alias:
<% result.getValue('listField').toDv() %>
```

if the value of the field is `["Hello", "World"]`, the above code will print:

```markdown
[listField:: "Hello", "World"]
```

If the value were a primitive, like the string "Hello World", the above code would print:

```markdown
[listField:: Hello World]
```


### `map(fn: (value: any) => any): ResultValue` method

The map method is a powerful one that allows you to transform the value contained in the ResultValue object without extracting it, allowing you to chain multiple transformations.

```typescript
<% result.getValue('listField').map((value) => value.toUpperCase()).bullets %>
```

The above code will print the list field as a bullet list, but all the values will be uppercased.

The map method takes a function that takes the value and returns a new value.
It can be used when none of the provided printing are enough for your use case, or when one of them is almost what you need but you need to transform the value a bit more.


### `trimmed`,`lower`,`upper` shortcuts

The ResultValue class provides some shortcuts to common transformations of the value.
They are:
 - `trimmed`: Trims the value, removing any leading or trailing whitespace.
 - `lower`: Converts the value to lowercase.
 - `upper`: Converts the value to uppercase.

All of these shortcuts return a new ResultValue object, so you can chain them with other methods.

```typescript
<% result.getValue('listField').trimmed.upper.bullets %>
```

The above code will print the list field as a bullet list, but all the values will be uppercased and trimmed.
You can chain as many or as little as you want.
The most common use is probably just to use one of them, like `trimmed` or `upper`.

```typescript
<% result.getValue('myField').trimmed %>
```

All of this shortcuts are able to handle single values and lists, so you can use them with any value.
