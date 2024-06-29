---
title: Release notes for 1.4x.0
date: 2024-06-29
tags: release-notes
---

This is a very exciting release for me, because it includes one of the features that I have been wanting to implement for a long time, and also one of the most requested features. But it also includes some minor improvements, so let's take those first:

- The placeholder of the label is set by default to the name of the field. This will make it easier for people to understand that the default label value is the name of the field.

Now the big feature:

## **Dependent fields**

As with every new feature, I like to start small, so this first version is very simple.
It just settles the basic foundation and works only with the most basic field types.
This will allow me to gather feedback and improve it in the next releases after making sure that the basic functionality is working as expected.

In this first approach there are not many safeguards either, so you can end up in forms that don't render anything, for example because of with fields that are excluding each other. I don't think this is going to be a big problem in practice, but I will be monitoring the feedback to see if it is necessary to add some kind of validation, or at least some kind of warning.
The reason I am not adding it any limitations in this first version is because flexibility: forms can be called with parameters to omit fields, default values, etc. and I don't want to limit that flexibility.

Here are some screenshots of the feature in action.

Form builder:

![boolean comparison](<conditional-boolean.png>)
![string comparison](<conditional-string.png>)

Form in preview mode with the condition met
![condition met](<condition-met.png>)
with the condition not met
![condition not met](<condition-not-met.png>)

The wording of the feature is not final, I'm not very satisfied with the current wording, so I'm open to suggestions.
I hope you like it, that it does not introduce too many inconveniences and that it is useful to you.

Please let me know your thoughts and suggestions.
