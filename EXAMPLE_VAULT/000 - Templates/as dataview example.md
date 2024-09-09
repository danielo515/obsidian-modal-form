## Data

<%*
const formApi = app.plugins.plugins.modalforms.api;
const result = await formApi.exampleForm({
    values: {
        dataview_example: 'John',
        age: 32,
        hidden_field: 'hidden value'
    }
});
tR += result.asDataviewProperties();
-%>
