---
<%* 
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('example-form');
tR += result.asFrontmatterString({
	pick:['second']
	});
-%>
---

<%*
tR += result.asDataviewProperties({ omit:['second','toggle'] });
tp.context = { parent: "parent" }
await tp.file.include('[[02_sub_template]]')
console.log("parent",tp.context, this.context)
%>