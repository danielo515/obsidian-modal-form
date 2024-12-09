---
title: Release notes for 1.53.0
date: 2024-12-09
tags: release-notes
---

## Introducing Image Input

This release introduces a brand new input type: the image input! This new component allows you to upload images directly through your forms, automatically saving them to your vault.
I'm particularly excited about this new feature because I already have a lot of usecases for it on my daily life (I like to keep a record of the restaurants I visit and the meals I eat there).
The possibilities it opens are big and I'm really excited about seeing what new and more visual experiences you can create using it.
I also think that having a specialized way of adding images to your notes/templates is better than the obsidian way in a lot of situations.

### What's New

The image input is a powerful new addition to our form inputs family that lets you:

- Save images directly to your vault
- Preview the image
- Atomically define where each image will be saved for each input
- Use templates for file naming with date/time placeholders

Here's how it looks in action:
![Image input example](image-input-example.png)

### Using the Image Input

Adding an image input to your form is very straightforward using the FormBuilder. Here's an example screenshot:
![image in input builder](image-input-builder.png)

The configuration has two main settings:

- `filenameTemplate`: Define how your files will be named. You can use placeholders like `{{date}}`, `{{time}}`, or `{{datetime}}`.
- `saveLocation`: Specify where in your vault the image will be saved. Don't worry if the folder doesn't exist - it will be created automatically!
