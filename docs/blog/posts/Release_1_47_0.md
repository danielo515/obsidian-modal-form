---
title: Release notes for 1.47.0 and a statement of intent
date: 2024-06-22
tags: [ "release-notes" ]
---

## Release notes for 1.47.0

This is mostly a technical release that also includes some minor improvements.

The technical part of it is that now the fields of the form are rendered using svelte rather than manually calling DOM manipulation methods
or the obsidian `Setting` class.
I made this because it simplifies the creation of the view, it will be more maintainable, but the most important reason is that it will
make much much easier to implement functionalities that require atomic re-renders of the form.
The most important and requested feature this will enable is the ability to have dynamic fields that depend on the value of other fields.
**This is not implemented yet**, but it will be much easier to do now and I will start working on it soon.

For the minor improvements, I added some more color to the form fields, so now the stars that indicate required fields are colorful.

![colorful stars](<Screenshot 2024-06-22 at 13.42.07.png>)

I also improved the error messages when submitting a form with errors.
Now the error message appears below the field in red color:

![better field errors](<Screenshot 2024-06-22 at 13.41.51.png>)

Also related to errors, the notifications that appear when submitting a form with errors are now grouped in a single notification containing all the errors:

![grouped notification errors](<Screenshot 2024-06-22 at 13.41.42.png>)

### Statement of intent

When I started this project, I had not much experience with Obsidian and absolute no experience with Obsidian plugin development.
Also, my initial idea was to create a very simple plugin, basically something wrapping some basic existing Obsidian functionality and glueing it with some other tools I like to use (templater mainly) while making the process streamlined and more user friendly.
Since then, the plugin has gained a lot of popularity, it has some thousand of installs, making it my most popular project by far.
Coming from a web development background, I was imposing myself some limitations that I learned that do not make any sense in Obsidian.
For example, at first I was very worried about the bundle size of the plugin (which is still very small) and I was trying to avoid using external libraries as much as possible.
However, some of the most popular plugins weight several MBs and nobody seems to care.
Also, many plugins diverge significantly from the Obsidian default appearance, and that is not a problem at all.
What does that mean for modal form? That I will try to build better functionalities, always trying to keep the plugin simple and focused, but I will no longer
limit myself to what Obsidian offers out of the box, and I will not be afraid of using external libraries if they make sense.

Hope you like the direction I'm taking with the plugin. I'm very excited about the future of it.
