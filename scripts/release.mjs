import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

/**
 * Self-contained release script for Obsidian plugins.
 *
 * What it does:
 *   1. Finds the latest git tag (assumed to be the last released version).
 *   2. Reads conventional-commit-style messages since that tag.
 *   3. Determines the version bump (major / minor / patch).
 *   4. Updates package.json, manifest.json, and versions.json.
 *   5. Outputs the new version and generated release notes for the workflow.
 *
 * Conventional commit prefixes recognised (conventionalcommits.org/en/v1.0.0):
 *   feat:     → minor bump
 *   fix:      → patch bump
 *   <type>!:  → major bump (e.g. feat!:, fix(scope)!:, refactor!:)
 *   BREAKING CHANGE / BREAKING-CHANGE in footer → major bump
 *   chore:    → excluded from release notes entirely
 *   Everything else (docs, refactor, …) → patch bump (if any)
 *
 * Usage:
 *   node scripts/release.mjs            # normal run
 *   node scripts/release.mjs --dry-run  # preview without writing files
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd) {
    return execSync(cmd, { encoding: "utf-8" }).trim();
}

function bumpVersion(version, level) {
    const [major, minor, patch] = version.split(".").map(Number);
    switch (level) {
        case "major":
            return `${major + 1}.0.0`;
        case "minor":
            return `${major}.${minor + 1}.0`;
        case "patch":
            return `${major}.${minor}.${patch + 1}`;
        default:
            throw new Error(`Unknown bump level: ${level}`);
    }
}

// ---------------------------------------------------------------------------
// 1. Determine the last released tag
// ---------------------------------------------------------------------------

let lastTag;
try {
    // Tags in this repo have no "v" prefix (e.g. "1.61.1")
    lastTag = run("git describe --tags --abbrev=0");
} catch {
    // No tags yet — use the very first commit (take only the first if multiple roots exist)
    lastTag = run("git rev-list --max-parents=0 HEAD").split("\n")[0];
}
console.log(`Last tag: ${lastTag}`);

// ---------------------------------------------------------------------------
// 2. Collect commits since the last tag
// ---------------------------------------------------------------------------

const log = run(`git log ${lastTag}..HEAD --pretty=format:"%s|||%h" --no-merges`);

if (!log) {
    console.log("No new commits since last tag. Nothing to release.");
    process.exit(0);
}

const commits = log.split("\n").map((line) => {
    const [message, hash] = line.split("|||");
    return { message, hash };
});

// ---------------------------------------------------------------------------
// 3. Categorise commits and decide bump level
// ---------------------------------------------------------------------------

// Breaking change: <type>(<scope>)?!: or BREAKING CHANGE / BREAKING-CHANGE in body/footer
const BREAKING_RE = /^[a-z]+(\(.+\))?!:/;

const categories = {
    breaking: [],
    features: [],
    fixes: [],
    other: [],
};

for (const { message, hash } of commits) {
    const lower = message.toLowerCase();

    // Detect breaking changes per conventional commits spec
    const isBreaking =
        BREAKING_RE.test(lower) ||
        lower.includes("breaking change") ||
        lower.includes("breaking-change");

    if (isBreaking) {
        categories.breaking.push({ message, hash });
    } else if (lower.startsWith("feat")) {
        categories.features.push({ message, hash });
    } else if (lower.startsWith("fix")) {
        categories.fixes.push({ message, hash });
    } else if (lower.startsWith("chore")) {
        // Skip chore commits — they are not relevant to release notes
        continue;
    } else {
        categories.other.push({ message, hash });
    }
}

let bumpLevel = "patch";
if (categories.breaking.length > 0) bumpLevel = "major";
else if (categories.features.length > 0) bumpLevel = "minor";

// ---------------------------------------------------------------------------
// 4. Compute the new version
// ---------------------------------------------------------------------------

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const currentVersion = pkg.version;
const newVersion = bumpVersion(currentVersion, bumpLevel);

console.log(`Bump: ${currentVersion} → ${newVersion} (${bumpLevel})`);

// ---------------------------------------------------------------------------
// 5. Generate release notes (markdown)
// ---------------------------------------------------------------------------

function formatSection(title, items) {
    if (items.length === 0) return "";
    const lines = items.map(({ message, hash }) => `- ${message} (${hash})`).join("\n");
    return `## ${title}\n\n${lines}\n\n`;
}

let notes = "";
notes += formatSection("Breaking Changes", categories.breaking);
notes += formatSection("Features", categories.features);
notes += formatSection("Bug Fixes", categories.fixes);
notes += formatSection("Other Changes", categories.other);

if (!notes) notes = "Maintenance release.\n";

console.log("\n--- Release Notes ---\n");
console.log(notes);

// ---------------------------------------------------------------------------
// 6. Update version files
// ---------------------------------------------------------------------------

const dryRun = process.argv.includes("--dry-run");

if (dryRun) {
    console.log("Dry run — no files written.");
} else {
    // package.json
    pkg.version = newVersion;
    writeFileSync("package.json", JSON.stringify(pkg, null, "    ") + "\n");

    // manifest.json
    const manifest = JSON.parse(readFileSync("manifest.json", "utf-8"));
    const { minAppVersion } = manifest;
    manifest.version = newVersion;
    writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

    // versions.json — maps each version to its minimum Obsidian app version
    const versions = JSON.parse(readFileSync("versions.json", "utf-8"));
    versions[newVersion] = minAppVersion;
    writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

    console.log("Updated: package.json, manifest.json, versions.json");
}

// ---------------------------------------------------------------------------
// 7. Write outputs for GitHub Actions (if running in CI)
// ---------------------------------------------------------------------------

if (process.env.GITHUB_OUTPUT) {
    const outputFile = process.env.GITHUB_OUTPUT;
    const lines = [
        `new_version=${newVersion}`,
        `bump_level=${bumpLevel}`,
        `release_notes<<RELEASE_NOTES_EOF`,
        notes.trim(),
        `RELEASE_NOTES_EOF`,
    ];
    writeFileSync(outputFile, lines.join("\n") + "\n", { flag: "a" });
    console.log("Wrote GitHub Actions outputs.");
}
