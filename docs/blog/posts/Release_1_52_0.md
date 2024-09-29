---
title: Release notes for 1.52.0
date: 2024-09-29
tags: release-notes
---

## Markdown block

This release introduces a new input, the "markdown block".
Just like the existing "document block" this is not a real input, but more a building block for richer forms.
The definition is expected to contain a function body returning a markdown string. This markdown string will then be rendered
into the form and the user filling it will be able to see it.

To illustrate with an example, imagine a simple form with a single text input, we can define a markdown block with this content:

```js
return `# hello
- line 1
- ${form.text}
- ![[image.png]]`
```

Have you noticed the image syntax? Yes, images are supported too.
This is how it looks once rendered:
![form containing markdown block](<Screenshot 2024-09-29 at 20.03.34.png>)

### Updates to the existing document block

Both Markdown block and document block now have access to the dataview API (along with the form data itself).
This allows to build much complex and data packed information panels.
To access the dataview API, you do normally just like in any other place using a special variable named `dv`.
For example, and continuing with the markdown example, we could render a list of all the people (in markdown) using dataview
like this:

```js
return dv.markdownList(dv.pages('#person').map(x => x.file.name))
```

That will render something like this:
![markdown using dataview](<Screenshot 2024-09-29 at 20.32.35.png>)
