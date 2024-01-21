#!/bin/bash
# Because mkdocs does not allow to use files outside the docs folder
# we need to copy the README.md file to the docs folder and remove
# the docs/ prefix from the links at build time.
cp README.md docs/index.md
cp CHANGELOG.md docs/changelog.md
sed -i '' -e 's/docs\///g' docs/index.md
mkdocs build
