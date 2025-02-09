import { readFileSync, writeFileSync } from "fs";

interface ReleaseNotes {
    version: string;
    date: string;
    features: string[];
    fixes: string[];
    changes: string[];
}

function getPackageVersion(): string {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
    return (pkg.version || "0.0.0").replaceAll(".", "_");
}

function generateReleaseNotes(notes: ReleaseNotes): string {
    return `---
title: Release notes for ${notes.version}
date: ${notes.date}
tags: [ "release-notes" ]
---
    
## What's New
    
${notes.features.map((f) => `- ${f}`).join("\n")}
    
## Bug Fixes
    
${notes.fixes.map((f) => `- ${f}`).join("\n")}
    
## Other Changes
    
${notes.changes.map((c) => `- ${c}`).join("\n")}
`;
}

const newRelease: ReleaseNotes = {
    version: getPackageVersion(),
    date: new Date().toISOString().slice(0, 10),
    features: [],
    fixes: [],
    changes: [],
};

const filename = `docs/blog/posts/Release_${newRelease.version}.md`;
writeFileSync(filename, generateReleaseNotes(newRelease));
console.log(`Created release notes at ${filename}`);
