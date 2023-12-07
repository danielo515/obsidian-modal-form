# Advanced usage examples

In this section of the docs you will find some advanced usage examples of modal-form-plugin

## Nesting form calls

## Modifying frontmatter with a form

If you want to modify the content of a notes frontmatter with one of your existing forms, put the following
snippet in a templater template, substituting the name of your form:

```js
<%*
const modalForm = app.plugins.plugins.modalforms.api; 
app.fileManager.processFrontMatter(tp.config.target_file,
  async (frontmatter) => { 
      const result = await modalForm.openForm('example-form', { values: {...frontmatter}});
      Object.assign(frontmatter, result.getData()); 
  })}, 200)
%>
```

The values the form understand and that are pressent in the frontmatter, will be populated with the values on the frontmatter.
Then, when you submit the form, the new values will overwrite the old ones, leaving the rest untouched.

## Making calling forms more convenient

If you are using templater, you can make calling forms more convenient by using the following snippet:

```js
const modalForm = app.plugins.plugins.modalforms.api;
module.exports = (formName, options) => modalForm.openForm(formName, options);
```

If you save this snippet as `openForm.js` in your templater snippets folder, then you can then call it like this from templater:


```js
<%*
const result = await tp.user.openForm('example-form', { values: { size: 'large' }});
%>
```
