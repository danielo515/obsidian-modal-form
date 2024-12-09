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
