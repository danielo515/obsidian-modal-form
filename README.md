# Obsidian Modal Form Plugin

This plugin for Obsidian (https://obsidian.md) allows you to define forms for filling data that you can open from anywhere you can run JavaScript. It uses TypeScript for type checking and documentation, and depends on the latest Obsidian plugin API.
Features

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
