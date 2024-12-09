<%*
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('image_input');
tR += result.asFrontmatterString();
console.log(result.image)
-%>

Here is the image manually rendered
 ![[<% result.image.value.name %>]]

And here is the image leveraging the shorthand to get a markdown link
<% result.image.link %>

Some TFile proxy properties:

- path: <% result.image.value.path %>
- name: <% result.image.value.name %>
- basename: <% result.image.value.basename %>
- extension: <% result.image.value.extension %>

Some TFile properties:

- ctime: <% result.image.value.TFile.stat.ctime %>
- mtime: <% result.image.value.TFile.stat.mtime %>
- size: <% result.image.value.TFile.stat.size %>
