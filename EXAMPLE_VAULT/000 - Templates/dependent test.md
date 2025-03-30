<%*

const result = await MF.openForm('dependent-books-test');

if (result.status === "ok") {
    // Generate note content based on form results
    tR += `# ${result.fields.selectedBook}\n\n`;
    tR += `## Reading Status\n\n`;
    tR += `Current status: Reading\n`;
    tR += `Rating: ${result.fields.minRating}⭐\n\n`;
    tR += `## Book Details\n\n`;
    tR += `- **Author**: ${result.fields.author}\n`;
    tR += `- **Genre**: ${result.fields.genre}\n`;
    if (result.fields.series) {
        tR += `- **Series**: ${result.fields.series}\n`;
    }
    tR += `\n\n## Notes\n\n`;
} else {
    tR += "Form was cancelled";
}

%>