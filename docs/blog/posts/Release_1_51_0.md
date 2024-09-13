---
title: Release notes for 1.51.0
date: 2024-09-12
tags: release-notes
---

## Hidden fields

This release introduces the concept of hidden fields.
The intended usage of this feature is to provide values to the form that are not visible to the user.
This has some applications such as:

- providing variables to the form-runtime that your dataview functions can use
- having certain fields deactivated using the conditional without any user interaction
- having certain values be part of the generated result, and used in the templates

I bet the community will be able to figure out some other interesting use-cases.
The reason I like this approach to much is a) because it is a web standard (this is common practice to communicate between backend and frontend in forms) and b) it plays nicely with all the existing form mechanisms without having to complicate the logic at all: formatting the output, reading the value from dataview functions, conditional rendering other fields, etc.

Hope you like it and find it useful.
