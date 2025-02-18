# Dataview Integration

Modal Form integrates with [Dataview](https://blacksmithgu.github.io/obsidian-dataview/) to provide powerful data querying capabilities within your forms. This integration allows you to create dynamic forms that can interact with your vault's data in real-time.

## Features

### 1. Dataview Input Fields

You can create input fields that use Dataview queries to provide suggestions. This is useful when you want to select values from your vault based on certain criteria.

Example:

```javascript
// Show all files tagged with #book
dv.pages('#book').file.name

// Show all files in a specific folder
dv.pages('"Books"').file.name

// Show all unique values of a specific frontmatter field
dv.pages().author.distinct()
```

### 2. Dynamic Queries Using Form Data

When using Dataview queries in your input fields, you can access the current form data using the `form` variable. This allows you to create dynamic queries that depend on other field values.

Example:

```javascript
// Show suggestions based on the current value of the 'category' field
dv.pages('#' + form.category).file.name

// Filter pages based on multiple form fields
dv.pages()
  .where(p => p.type == form.type && p.status == form.status)
  .file.name
```

### 3. Dataview in Document Blocks

Document blocks can use Dataview to display dynamic content based on form data. This is useful for showing previews, summaries, or related information as users fill out the form.

Example:

```javascript
// Show a list of related items based on form data
return dv.pages('#' + form.category)
  .where(p => p.rating >= form.minRating)
  .sort(p => p.rating, 'desc')
  .limit(5)
  .map(p => "- " + p.file.link + " (Rating: " + p.rating + ")")
  .join("\n")
```

### 4. Dataview in Markdown Blocks

Markdown blocks can combine Dataview queries with form data to create dynamic markdown content. This is particularly useful for creating previews or generating structured content.

Example:

```javascript
// Generate a summary table based on form selections
return dv.markdownTable(
  ["Name", "Rating", "Status"],
  dv.pages('#' + form.category)
    .where(p => p.status == form.status)
    .sort(p => p.rating, 'desc')
    .map(p => [p.file.link, p.rating, p.status])
)
```

## Best Practices

1. **Error Handling**: Dataview queries in forms are executed in a sandboxed environment. Always ensure your queries handle cases where form fields might be undefined.

2. **Performance**: Keep your queries focused and efficient. Use appropriate filters to limit the scope of the query.

3. **Accessing values**: The `form` variable provides access to the values of the form fields. Because users can not have yet filled the field you are trying to access this may lead to errors. Make sure to check for existence before accessing any form fields or use javascript optional chaining (`?.`).

4. **Real-time Updates**: Form data is automatically synchronized with your queries. When a form field changes, any dependent queries will be re-executed with the updated values.

## Examples

Here are some practical examples of how to use Dataview integration in your forms:

### Book Management Form

```javascript
// In a "Series" field, show suggestions based on the selected genre
dv.pages('#book')
  .where(p => p.genre == form.genre)
  .series
  .distinct()

// In a document block, show a preview of similar books
return dv.pages('#book')
  .where(p => 
    p.genre == form.genre && 
    p.rating >= form.minRating &&
    p.series == form.series
  )
  .sort(p => p.rating, 'desc')
  .limit(3)
  .map(p => `- ${p.file.link} (${p.rating}⭐)`)
  .join("\n")
```

### Project Management Form

```javascript
// Show team members based on selected department
dv.pages('#team-member')
  .where(p => p.department == form.department)
  .file.name

// In a markdown block, generate a project summary
return `## Project Summary
**Team**: ${form.teamName}
**Department**: ${form.department}

### Team Members
${dv.pages('#team-member')
  .where(p => p.department == form.department)
  .map(p => `- ${p.file.link} (${p.role})`)
  .join("\n")}
`
```

## Related Documentation

- [Form Builder](FormBuilder.md) - Learn how to create forms with Dataview integration
- [Managing Results](managing-results.md) - How to handle form results in your templates
- [Advanced Examples](advanced-examples.md) - More complex examples of Dataview integration
