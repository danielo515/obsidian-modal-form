import { readFileSync, writeFileSync } from "fs";

/**
 * This file keeps the manifest.json and version.json in sync with package.json
 * It is ran when you run `npm version patch|minor|major` and in CI
 * In CI reads from the package.json, because there is nothing in the environment
 */

let packageData = JSON.parse(readFileSync("package.json", "utf8"));
const targetVersion = process.env.npm_package_version || packageData.version;

// read minAppVersion from manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
console.info(
	"Version bumping to",
	targetVersion,
	"with minAppVersion",
	minAppVersion
);
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

console.table(versions);
console.table(manifest);
