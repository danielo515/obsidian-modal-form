# FormBuilder Helper

The FormBuilder is a utility that helps you create forms programmatically using a fluent API. It's accessible through the Modal Form plugin API.

## Getting Started

Access the form builder through the plugin API:

```typescript
const builder = app.plugins.plugins["obsidian-modal-form"].api.builder;

// Create a new form
const form = builder("example-contact-form", "Example Contact Form")
  .text({ name: "username", label: "Username" })
  .email({ name: "email", label: "Email" })
  .build();

// Open the form modal
app.plugins.plugins["obsidian-modal-form"].api.openModalForm(form);
```

## Core Methods

### builder(name: string, title?: string)
Creates a new form builder instance. The `name` parameter is required and must be unique. The `title` parameter is optional and defaults to the name.

```typescript
const form = builder("example-form", "Example Form")
  // ... add fields
  .build();
```

### build()
Finalizes the form creation and returns a form definition that can be used with `openModalForm`.

```typescript
const form = builder("example-form")
  .text({ name: "username" })
  .build();
```

## Field Methods

Each field method accepts these common parameters:
- `name`: (required) Unique identifier for the field
- `label`: (optional) Display label for the field
- `description`: (optional) Help text or description
- `hidden`: (optional) Whether the field should be hidden

### text
Adds a text input field.
```typescript
builder("example-form")
  .text({ name: "username", label: "Username" })
```

### number
Adds a number input field.
```typescript
builder("example-age-form")
  .number({ name: "age", label: "Age" })
```

### date
Adds a date input field.
```typescript
builder("example-birthday-form")
  .date({ name: "birthdate", label: "Birth Date" })
```

### time
Adds a time input field.
```typescript
builder("example-meeting-form")
  .time({ name: "meeting", label: "Meeting Time" })
```

### datetime
Adds a datetime input field.
```typescript
builder("example-appointment-form")
  .datetime({ name: "appointment", label: "Appointment" })
```

### textarea
Adds a multi-line text input field.
```typescript
builder("example-notes-form")
  .textarea({ name: "notes", label: "Notes" })
```

### toggle
Adds a toggle/switch input field.
```typescript
builder("example-settings-form")
  .toggle({ name: "active", label: "Active" })
```

### email
Adds an email input field.
```typescript
builder("example-contact-form")
  .email({ name: "contact", label: "Contact Email" })
```

### tel
Adds a telephone number input field.
```typescript
builder("example-phone-form")
  .tel({ name: "phone", label: "Phone Number" })
```

### note
Adds a note field that references an Obsidian note.
```typescript
builder("example-reference-form")
  .note({ name: "reference", label: "Reference", folder: "Notes" })
```

### folder
Adds a folder selection field.
```typescript
builder("example-save-location-form")
  .folder({ name: "destination", label: "Save Location" })
```

### slider
Adds a numeric slider input field.
```typescript
builder("example-rating-form")
  .slider({ name: "rating", label: "Rating", min: 0, max: 5 })
```

### tag
Adds a tag selection field.
```typescript
builder("example-categories-form")
  .tag({ name: "categories", label: "Categories" })
```

### select
Adds a dropdown selection field.
```typescript
builder("example-priority-form")
  .select({ 
    name: "priority", 
    label: "Priority", 
    options: ["Low", "Medium", "High"] 
  })
```

### dataview
Adds a field populated by a Dataview query.
```typescript
builder("example-tasks-form")
  .dataview({ 
    name: "tasks", 
    label: "Tasks",
    query: "task from #project" 
  })
```

### multiselect
Adds a multiple selection field.
```typescript
builder("example-tags-form")
  .multiselect({ 
    name: "tags", 
    label: "Tags",
    options: ["work", "personal", "urgent"]
  })
```

### document_block
Adds a document block field.
```typescript
builder("example-document-form")
  .document_block({ 
    name: "content", 
    label: "Content",
    body: "Initial content" 
  })
```

### markdown_block
Adds a markdown block field.
```typescript
builder("example-markdown-form")
  .markdown_block({ 
    name: "notes", 
    label: "Notes",
    body: "# Notes" 
  })
```

### image
Adds an image upload field.
```typescript
builder("example-avatar-form")
  .image({ 
    name: "avatar", 
    label: "Avatar",
    filenameTemplate: "avatar-${date}",
    saveLocation: "assets/images" 
  })
```

### file
Adds a file upload field.
```typescript
builder("example-attachment-form")
  .file({ 
    name: "attachment", 
    label: "Attachment",
    folder: "attachments",
    allowedExtensions: [".pdf", ".doc", ".docx"] 
  })
```

## Complete Example

Here's a complete example of creating and opening a contact form:

```typescript
const api = app.plugins.plugins["obsidian-modal-form"].api;
const form = api.builder("example-contact-form", "Example Contact Form")
  .text({ name: "name", label: "Full Name" })
  .email({ name: "email", label: "Email Address" })
  .tel({ name: "phone", label: "Phone Number" })
  .textarea({ name: "message", label: "Message" })
  .build();

api.openModalForm(form);
