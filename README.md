# Obsidian Modal Form Plugin

This plugin for [Obsidian](https://obsidian.md) that allows to define forms for filling data that can opened from anywhere you can run JavaScript.



https://github.com/danielo515/obsidian-modal-form/assets/2270425/542974aa-c58b-4733-89ea-9c20ea11bee9



## Features

- Forms open in a modal window and return you the values, so you can trigger it from:
  - Templater templates
  - QuickAdd captures
  - DataviewJS queries
  - Many other places...
- Define forms using a simple JSON format
- UI for defining forms
- Many input types 
  - number
  - date
  - free text
  - text with autocompletion for note names
  - select from a list (fixed values or other notes)


## Usage

### Call the form from JavaScript

Since the main usage of this plugin is opening forms and getting back their data let's start with that. If you want to lear how to create forms, skip to the next section [define a form](define-a-form).

The plugin exposes an API that can be accessed from any JavaScript code that has access to the global `app` object. So, in order to get the API you can do:

```javascript
const modalForm = const formApi = app.plugins.plugins.obsidianModalForm.api;
````

From here you can call any of the mmain method of the API, `openForm` which allows you to open a form by name and get back the data. Let's see an example:

```javascript
const modalForm = const formApi = app.plugins.plugins.obsidianModalForm.api;
const result = await formApi.openForm('exampleForm');
```

The result is a special type of object that contains the data of the form. 
It also has somme convenience methods to help you process the returned data.
One of them is `asFrontmatterString`, which returns the data as a string that can be used in a frontmatter block. Let's see an example using templater:


#### Usage with Templater

```javascript
---
<%* 
const modalForm = const formApi = app.plugins.plugins.obsidianModalForm.api;
const result = await formApi.openForm('exampleForm');
tR += result.asFrontmatterString();
-%>
---
```

When you insert this template in a note, it will open the form, and once you submit it, it will insert the data in the note as a frontmatter block.

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
