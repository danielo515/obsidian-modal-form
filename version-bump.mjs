import { readFileSync, writeFileSync } from "fs";

/**
 * This file keeps the manifest.json and version.json in sync with package.json
 * It is ran when you run `npm version --patch` and in CI
 */

let packageData = JSON.parse(readFileSync("package.json", "utf8"));
const targetVersion = process.env.npm_package_version || packageData.version;

// read minAppVersion from manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));
