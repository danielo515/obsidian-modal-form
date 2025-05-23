---
title: Release notes for 1.48.0
date: 2024-07-02
tags: [ "release-notes" ]
---

This is a very exciting release for me, because it includes one of the features that I have been wanting to implement for a long time, and also one of the most requested features. But it also includes some minor improvements, so let's take those first:

- The placeholder of the label is set by default to the name of the field. This will make it easier for people to understand that the default label value is the name of the field. ![name as label placeholder](<Screenshot 2024-07-02 at 17.45.35.png>)

Now the big feature:

## **Conditional fields**

As with every new feature, I like to start small, so this first version is very simple.
It just settles the basic foundation and works only with the most basic field types.
This will allow me to gather feedback and improve it in the next releases after making sure that the basic functionality is working as expected.

In this first approach there are not many safeguards either, so you can end up in forms that don't show any field, for example because of fields that are excluding each other. I don't think this is going to be a big problem in practice, but I will be monitoring the feedback to see if it is necessary to add some kind of validation, or at least some kind of warning.
The reason I am not adding it any limitations in this first version is because flexibility: forms can be called with parameters to omit fields, default values, etc. and I don't want to limit that flexibility.

Here are some screenshots of the feature in action.

Form builder:
![boolean condition](<Screenshot 2024-07-02 at 17.36.07.png>)
![text condition](<Screenshot 2024-07-02 at 17.34.38.png>)

Form in preview mode with the condition met
![condition met](<condition-met.png>)
with the condition not met
![condition not met](<condition-not-met.png>)

This first iteration is purely visual: just because a field is hidden it does not mean that, if it has a value, is not going to be included in the result. If you fill a field, and then do something that makes it hidden, the value will still be included in the result. I think in practice most people just needs a way to start with several fields hidden, and then show them based on the value of other fields, so I think this is a good first approach.

The wording of the feature is not final, I'm not very satisfied with the current wording, so I'm open to suggestions.
I hope you like it, that it does not introduce too many inconveniences and that it is useful to you.

Please let me know your thoughts and suggestions.
