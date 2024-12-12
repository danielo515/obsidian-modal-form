
<%*
/*

```ts
*/
  const run = async (frontmatter) => {
    const result = await MF.openForm('frontmatter', {
      values: { ...frontmatter },
    });
    return result.getData();
  };
  //first we get the data from the form
  const data = await run(tp.frontmatter);
 // Then we update the frontmatter with the new data
  app.fileManager.processFrontMatter(
    tp.config.target_file,
    frontmatter => {
      Object.assign(frontmatter, data);
    },
  );
/*
```

*/
%>
