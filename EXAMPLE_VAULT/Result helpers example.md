<%* 
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('simple', {values:{
	list:['1984','Hello'],
	name: 'Fedever',
	number: 55
	}});
%>

## Simple values
<% result.getV('name') %>
### Upper
<% result.getV('name').upper %>
number
<% result.getV('number') %>
<% result.getV('number').toBullets() %>
<%* console.log(result.getV('number')) %>
## Shorthand
<% result.getV('number').bullets %>
## List
<% result.getV('list') %>
<% result.getV('list').toBullets() %>
### Shorthand
<% result.getV('list').bullets %>
<% result.getV('list').upper.bullets %>
<% result.getV('list').lower.bullets %>
<% result.getV('list').toDv() %>
<% result.getV('list').upper.toDv() %>
## Invalid
<% result.getV('invalid') %>
<% result.getV('invalid').bullets %>
<% result.getV('invalid').toBullets() %>

```dataview
table list
where file.name = this.file.name
```