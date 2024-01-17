#!/bin/bash
cp README.md docs/index.md
sed -i '' -e 's/docs\///g' docs/index.md
mkdocs build
