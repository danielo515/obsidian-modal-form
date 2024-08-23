---
<%* 
const modalForm = app.plugins.plugins.modalforms.api;
const result1 = await modalForm.limitedForm('example-form',{pick:['second']});
tR += result1.asFrontmatterString();
const result2 = await modalForm.limitedForm('example-form',{omit:['second','toggle']});
tR += result2.asFrontmatterString();
-%>
---
