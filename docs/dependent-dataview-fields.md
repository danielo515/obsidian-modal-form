# Creating Forms with Dependent Dataview Fields

This guide provides a step-by-step approach to creating forms where dataview fields depend on previous form values to select different result sets.

## Prerequisites

- Modal Form plugin installed
- Dataview plugin installed and enabled
- Optionally Templater plugin installed for triggering the form and create new notes

## Step 1: Understanding the Basics

First, let's understand how the Modal Form plugin works with Dataview:

1. Modal Form allows you to create forms with various field types
2. Dataview fields can query your vault data dynamically
3. Form values can be accessed using the `form` variable in dataview queries
4. Changes to form fields automatically trigger updates to dependent dataview fields

## Step 2: Creating a Basic Form Structure

To create a form with dependent fields, start by creating a new form in the form manager. For this guide, we'll create a form named `dependent-books-test` which we'll reference in later steps.

## Step 3: Adding Primary Selection Fields

Add fields that will influence subsequent dataview queries:

![genre and rating fields](<Screenshot 2025-03-30 at 11.46.27.png>)

For the genre field, use a dataview query to get all unique genres:

```javascript
dv.pages("#book").genre.distinct().sort()
```

For the rating slider, set appropriate min and max values:

```javascript
{
  "min": 1,
  "max": 5
}
```

## Step 4: Adding Dependent Dataview Fields

Now add fields that depend on the values selected in the previous fields:

![author field](<Screenshot 2025-03-30 at 11.48.50.png>)

For the author field, filter by the selected genre:

```javascript
dv.pages("#book")
  .where(p => p.genre == form.genre)
  .author.distinct().sort()
```

![series field](<Screenshot 2025-03-30 at 11.50.40.png>)

For the series field, filter by both genre and author:

```javascript
dv.pages("#book")
  .where(p => p.genre == form.genre && p.author == form.author)
  .series.distinct().sort()
```

## Step 5: Adding a Preview Block

Add a markdown block to show a preview based on the current selections:

![preview field](<Screenshot 2025-03-30 at 11.56.34.png>)

Use this query to display matching books:

```javascript
return dv.pages("#book")
  .where(p => 
    p.genre == form.genre && 
    p.rating >= form.minRating && 
    (form.author ? p.author == form.author : true) && 
    (form.series ? p.series == form.series : true)
  )
  .sort(p => p.rating, "desc")
  .limit(5)
  .map(p => `- ${p.file.link} (${p.rating}⭐)`)
  .join("\n")
```

## Step 6: Adding a Book Selection Field

Add a field to select a specific book based on all previous selections:

```javascript
dv.pages("#book")
  .where(p => 
    p.genre == form.genre && 
    p.rating >= form.minRating && 
    (form.author ? p.author == form.author : true) && 
    (form.series ? p.series == form.series : true)
  )
  .sort(p => p.rating, "desc")
  .file.name
```

## Step 7: Using the Form in a Template

Create a template to use your form:

```javascript
<%*
const result = await MF.openForm('dependent-books-test');

if (result.status === "ok") {
  // Generate note content based on form results
  tR += `# ${result.fields.selectedBook}\n\n`;
  tR += `## Reading Status\n\n`;
  tR += `Current status: Reading\n`;
  tR += `Rating: ${result.fields.minRating}⭐\n\n`;
  tR += `## Book Details\n\n`;
  tR += `- **Author**: ${result.fields.author}\n`;
  tR += `- **Genre**: ${result.fields.genre}\n`;
  if (result.fields.series) {
    tR += `- **Series**: ${result.fields.series}\n`;
  }
  tR += `\n\n## Notes\n\n`;
} else {
  tR += "Form was cancelled";
}
%>
```

## Step 8: Error Handling for Dependent Fields

When working with dependent fields, it's recommended to handle cases where previous fields haven't been filled yet. Here's one example of how to modify your queries to handle these cases:

For the author field:

```javascript
form.genre ? dv.pages("#book")
  .where(p => p.genre == form.genre)
  .author.distinct().sort() : []
```

For the series field:

```javascript
form.genre && form.author ? dv.pages("#book")
  .where(p => p.genre == form.genre && p.author == form.author)
  .series.distinct().sort() : []
```

For the book selection field:

```javascript
form.genre ? dv.pages("#book")
  .where(p => 
    p.genre == form.genre && 
    p.rating >= form.minRating && 
    (form.author ? p.author == form.author : true) && 
    (form.series ? p.series == form.series : true)
  )
  .sort(p => p.rating, "desc")
  .file.name : []
```

## Step 9: Adding Multi-select Dependent Fields

For more complex scenarios, you can use multi-select fields with dependencies:

```javascript
dv.pages("#book")
  .where(p => p.genre == form.genre)
  .file.tags
  .flatMap(t => t)
  .distinct()
  .sort()
```

## Step 10: Saving and Using Your Form

1. Save your template in the Obsidian vault
2. Create a button, command or hotkey to trigger the template
3. When the template is triggered, it will open the form and create a new note with the selected data

## Tips

1. **Cascading Dependencies**: You can create multiple levels of dependencies (genre → author → series → book)
2. **Error Handling**: Always check if form fields exist before using them in queries
3. **Real-time Updates**: Form data is automatically synchronized with your queries
