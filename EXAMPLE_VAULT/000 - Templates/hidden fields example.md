
<%*
const formApi = app.plugins.plugins.modalforms.api;
const result = await formApi.openForm('hidden-fields',{
    values: {
        name: 'Bla',
        hidden_text: 'hidden value',
        hidden_date: new Date().toISOString(),
        hidden_number: 55
    }
});
tR += result.asDataviewProperties();
-%>
