<%* 
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('simple', {values:{
	list:['1984','Hello'],
	name: 'Fedever',
	number: 55
	}});
%>

## Simple values
<% result.name %>
### Upper
<% result.name.upper %>
number
<% result.number %>
<% result.number.toBullets() %>
<%* console.log(result.number) %>
## Shorthand
<% result.number.bullets %>
## List
<% result.list %>
<% result.list.toBullets() %>
### Shorthand
<% result.list.bullets %>
<% result.list.upper.bullets %>
<% result.list.lower.bullets %>
<% result.list.toDv() %>
<% result.list.upper.toDv() %>
## Invalid
<% result.invalid -%>
<% result.invalid.bullets -%>
<% result.invalid.toBullets() -%>

```dataview
table list
where file.name = this.file.name
```
[[Fátima|Fátima]]