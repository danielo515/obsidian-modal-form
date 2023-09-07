# Obsidian Modal Form Plugin

This plugin for [Obsidian](https://obsidian.md) allows to define forms that can be opened from anywhere you can run JavaScript, so you can combine it with other plugins like [Templater](https://github.com/SilentVoid13/Templater) or [QuickAdd](https://github.com/chhoumann/quickadd).

https://github.com/danielo515/obsidian-modal-form/assets/2270425/542974aa-c58b-4733-89ea-9c20ea11bee9


## Features

- Forms open in a modal window and return you the values, so you can trigger it from:
  - Templater templates
  - QuickAdd captures
  - DataviewJS queries
  - Many other places...
- Define forms using a simple JSON format
- Create and manage a collection of forms, each identified by a unique name
- User interface for creating new forms
- Many input types 
  - number
  - date
  - free text
  - text with autocompletion for note names
  - select from a list 
    - list of fixed values 
    - list of notes from a folder


## Why this plugin?

Obsidian is a great tool for taking notes, but it is also a nice for managing data.
However, when it's time to capture structured data it doesn't offer many conveniences.
Some plugins like [Templater](https://github.com/SilentVoid13/Templater) or [QuickAdd](https://github.com/chhoumann/quickadd) alleviate this problem with templates/automation that ease the creation of notes with a predefined structure, but then you have to fill the data manually. 
This plugins have some little convenience inputs, but they are limited to a single value at a time, and they don't even have labels.
All of the mentioned tools are great at their job and unleash super convenient workflows.
For that reason, rather than offering an alternative, this plugin is designed as a complement to them, offering some basic building blocks that you can integrate with your existing templates and workflows.

## Scope of this plugin

This plugin is intentionally narrow in scope. As it's mentioned in the previous section, it is designed as a building block, so you can integrate it with other plugins and workflows.
The only features that I will consider adding will be ones about improving the form itself.

## Usage

### Call the form from JavaScript

Since the main usage of this plugin is opening forms and getting back their data let's start with that. If you want to lear how to create forms, skip to the next section [define a form](define-a-form).

The plugin exposes an API that can be accessed from any JavaScript code that has access to the global `app` object. So, in order to get the API you can do:

```javascript
const modalForm = app.plugins.plugins.obsidianModalForm.api;
````

From here you can call any of the main method of the API, `openForm` which allows you to open a form by name and get back the data. Let's see an example:

```javascript
const modalForm = app.plugins.plugins.obsidianModalForm.api;
const result = await modalForm.openForm('example-form');
```

The result is a special type of object that contains the data of the form. 
It also has somme convenience methods to help you process the returned data.
One of them is `asFrontmatterString`, which returns the data as a string that can be used in a frontmatter block. Let's see an example using templater:


#### Usage with Templater

```javascript
---
<%* 
const modalForm = app.plugins.plugins.obsidianModalForm.api;
const result = await modalForm.openForm('example-form');
tR += result.asFrontmatterString();
-%>
---
```

When you insert this template in a note, it will open the form, and once you submit it, it will insert the data in the note as a frontmatter block.

#### Usage with QuickAdd

In order to open a form from QuickAdd capture, you need to create a capture and activate the capture format, then in the format text-area you must create a code block with the language defined as `js quickadd` and copy the code below:
```javascript
	```js quickadd
	const modalForm = app.plugins.plugins.obsidianModalForm.api;
	const result = await modalForm.openForm('example-form');
	return result.asDataviewProperties();
	``` 
````

Here you have an example screenshot of how it should look like:
![quick capture example](media/image.png)

### FormResult Methods

The `FormResult` object returned by the `openForm` method has several methods that can be used to process the form data. Here is a brief description of each method:

#### asFrontmatterString()

This method returns the form data as a string that can be used in a frontmatter block. It formats the data in YAML syntax. Here is an example of how to use it:

#### asDataviewProperties()

This method returns the form data as a string of dataview properties. Each key-value pair in the form data is converted into a string in the format `key:: value`. Here is an example of how to use it:

#### getData()

This method returns a copy of the form data. It can be used when you need to manipulate the form data without affecting the original data. 

#### asString(template: string)

This method returns the form data formatted as a string matching the provided template. The template is a string that can contain placeholders in the format `{{key}}`, which will be replaced with the corresponding value from the form data. Here is an example of how to use it in a templater tempmlate:

```
<%* 
const modalForm = app.plugins.plugins.obsidianModalForm.api;
const result = await modalForm.openForm('example-form');
tR += result.asString('{{Name}} is {{age}} years old and his/her favorite food is {{favorite_meal}}. Family status: {{is_family}}');
-%>
```


### Define a form

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/modalForm/`.

## How to develop

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

### Releasing new releases

- run `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> The command `npm version whatever` will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`
