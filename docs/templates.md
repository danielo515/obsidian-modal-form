# Templates

Templates allow you to bind dynamic text outputs to your forms.
Forms that have templates binded to them are subject to be used to create new notes or to insert them.
If you use either the command to create a new note from a form or the insert form command, after the form is submitted its template will be processed using the form's values to generate the final text.
After the form template is processed, if you have the templater plugin installed, the final text will be processed by templater. See the [Templater Support](#templater-support) section for more information.

## Template Syntax

A template consists of plain text mixed with variables and commands:

- Variables: Wrapped in double curly braces `{{ }}`, they are replaced with form field values
- Commands: Special instructions wrapped in `{{# #}}` that control template behavior

### Variables

Variables are placeholders that get replaced with form field values. The variable name must match a field name from your form:

```
Hello {{name}}! Your favorite color is {{color}}.
```

### Available Commands

#### Frontmatter Command

The frontmatter command controls which form fields appear in the YAML frontmatter section of your note:

```
{{# frontmatter pick: title, tags #}}
```

Options:

- `pick`: Only include these specific fields in the frontmatter
- `omit`: Exclude these fields from the frontmatter

You can combine both options:

```
{{# frontmatter pick: title, tags, date omit: draft #}}
```

If no options are specified, all form fields will be included in the frontmatter:

```
{{# frontmatter #}}
```

## Templater Support

If you have the [Templater](https://github.com/SilentVoid13/Templater) plugin installed, Modal Form will also process any templater syntax in your form templates. This means you can combine both the form template variables and templater syntax in your templates.

For example:

```
Hello {{NAME}},
Today is <% tp.date.now() %> and you are using form templates!
```

The form will first replace `{{NAME}}` with the value from your form, and then Templater will process its own syntax (like `<% tp.date.now() %>`) afterwards.

Note: This feature is only available if you have the Templater plugin installed and enabled in your vault.

## Example

Here's a complete template example that combines variables and frontmatter:

```
{{# frontmatter pick: title, tags #}}

# {{title}}

Dear {{name}},

Thank you for your {{type}} submission about {{topic}}.

Best regards,
{{signature}}
```
