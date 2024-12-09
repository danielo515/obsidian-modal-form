<%* 
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('image_input');
tR += result.asFrontmatterString();
console.log(result.image)
-%>


Here is the image ![[<% result.image.value.name %>]]
<% result.image.value %>