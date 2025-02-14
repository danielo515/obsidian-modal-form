---
<%*
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('book-form');
tR += result.asFrontmatterString();
const { title, author, genre, series, status, rating } = result.data;
-%>
tags: book
---

# <% title %>

## Reading Status

Current status: <% status %>
Rating: <% rating %>⭐

## Book Details

- **Author**: <% author %>
- **Genre**: <% genre %>
<% series ? `- **Series**: ${series}` : '' %>

## Notes
