# Obsidian Modal Form Plugin

This plugin for [Obsidian](https://obsidian.md) that allows to define forms for filling data that can opened from anywhere you can run JavaScript. 
![demo](./media/frontmmatter-demo.mov)

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
