<%*
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('file_input');
tR += result.asFrontmatterString();
console.log(result.file)
-%>

Here is the file manually rendered
 ![[<% result.file.value.name %>]]

And here is the file leveraging the shorthand to get a markdown link
<% result.file.link %>

Some TFile proxy properties:

- path: <% result.file.value.path %>
- name: <% result.file.value.name %>
- basename: <% result.file.value.basename %>
- extension: <% result.file.value.extension %>

Some TFile properties:

- ctime: <% result.file.value.TFile.stat.ctime %>
- mtime: <% result.file.value.TFile.stat.mtime %>
- size: <% result.file.value.TFile.stat.size %>
