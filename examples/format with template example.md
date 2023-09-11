<%* 
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('example-form');
tR += result.asString('{{Name}} is {{age}} years old and his/her favourite food is {{favorite_meal}}. Family status: {{is_family}}');
%>
