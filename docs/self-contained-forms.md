# Self-contained forms in Templater templates

A common pattern when using Modal Form with [Templater](https://github.com/SilentVoid13/Templater) is to define forms in the plugin settings and then reference them by name from your templates. However, this means the form definition lives separately from the template that uses it.

Using the **Builder API**, you can define and open a form entirely within a Templater template, making it fully self-contained. This is useful when:

- You want the form definition to live next to the logic that uses it.
- You are sharing a template with others and don't want them to manually create a form in settings.
- You need a quick, one-off form that doesn't need to be reusable.

## Example: a simple book note template

```javascript
<%*
const modalForm = app.plugins.plugins.modalforms.api;

const result = await modalForm.openForm(
  modalForm.builder("book-note", "New Book Note")
    .text({ name: "title", label: "Book Title", required: true })
    .text({ name: "author", label: "Author", required: true })
    .select({ name: "status", label: "Status", options: ["To Read", "Reading", "Finished"] })
    .slider({ name: "rating", label: "Rating", min: 1, max: 5 })
    .build()
);
-%>
# <% result.getValue("title").value %>

Author:: <% result.getValue("author").value %>
Status:: <% result.getValue("status").value %>
Rating:: <% result.getValue("rating").value %>/5
```

The key idea is simple: instead of passing a form name string to `openForm`, you pass the result of `builder(...).build()` directly.

## Passing initial values

You can still pass options like `values` to pre-fill fields, just as you would with a named form:

```javascript
<%*
const modalForm = app.plugins.plugins.modalforms.api;

const result = await modalForm.openForm(
  modalForm.builder("meeting-note", "New Meeting")
    .date({ name: "date", label: "Date" })
    .text({ name: "attendees", label: "Attendees" })
    .textarea({ name: "agenda", label: "Agenda" })
    .build(),
  { values: { date: tp.date.now("YYYY-MM-DD") } }
);
-%>
```

## Tips

- The form `name` in `builder("name")` is only used internally and doesn't need to match any form in settings.
- The builder returns a new instance on each method call, so you can chain freely.
- Since the form is defined inline, you can use JavaScript variables to dynamically configure it (e.g., populate select options from Dataview queries).
