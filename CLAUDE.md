# CLAUDE.md - Obsidian Modal Form

## Project Overview

Obsidian Modal Form is a plugin for [Obsidian](https://obsidian.md) that lets users define forms for structured data entry, openable from anywhere JavaScript can run (Templater, QuickAdd, DataviewJS, etc.). Forms are defined as JSON-like structures, rendered as modals with Svelte components, and return typed results.

**Current version:** 1.61.1
**License:** MIT
**Min Obsidian version:** 0.15.0

## Build & Development Commands

```bash
npm run dev        # Watch mode — outputs to EXAMPLE_VAULT/.obsidian/plugins/modal-form/
npm run build      # Full build: lint + svelte-check + production bundle → main.js
npm run check      # Lint (ESLint) + svelte-check (no build)
npm run lint       # ESLint only
npm run test       # Jest (all tests in src/)
npm run test-w     # Jest in watch mode
```

**CI runs `npm run build && npm run test` on every pull request.** Both must pass.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.5 (strict mode, ES2019 target) |
| UI framework | Svelte 4 |
| Bundler | esbuild (CJS output) |
| Testing | Jest + ts-jest |
| Linting | ESLint + @typescript-eslint + fp-ts plugin + @stylistic |
| Formatting | Prettier (100 char width, trailing commas) |
| Validation | Valibot (schema-based) |
| FP library | fp-ts (Option, Either, TaskEither, pipe/flow) |
| Template parsing | parser-ts (parser combinators) |

## Repository Structure

```
src/
├── main.ts                    # Plugin entry point (extends Obsidian Plugin)
├── API.ts                     # Public API exposed globally as modalForms
├── FormModal.ts / .svelte     # Modal wrapper + Svelte form UI
├── ModalFormSettingTab.ts      # Plugin settings tab
├── core/                      # Business logic (UI-independent)
│   ├── formDefinition.ts      # Core types: FormDefinition, FieldDefinition, etc.
│   ├── formDefinitionSchema.ts # Valibot schemas + migration logic
│   ├── FormBuilder.ts         # Fluent API for programmatic form creation
│   ├── FormResult.ts          # Result wrapper (frontmatter, dataview, template output)
│   ├── settings.ts            # Plugin settings types/defaults
│   ├── input/                 # Input type schemas and field logic
│   │   ├── InputDefinitionSchema.ts  # Valibot schemas for all input types
│   │   └── dependentFields.ts        # Conditional field visibility
│   ├── template/              # Template system
│   │   ├── templateParser.ts  # Parser-ts template parser ({{ var }}, {# commands #})
│   │   ├── TemplateService.ts # Template service interface
│   │   ├── TemplaterService.ts # Templater plugin integration
│   │   └── BasicTemplateService.ts
│   └── files/                 # File service abstraction
├── store/                     # State management
│   ├── formEngine.ts          # Svelte store-based form state machine
│   └── SettngsStore.ts        # Global settings store
├── views/                     # Obsidian views + Svelte components
│   ├── components/
│   │   ├── Form/              # Field-level input components (one per type)
│   │   └── FormBuilder/       # UI for creating/editing form definitions
│   ├── EditFormView.ts        # View for editing a form definition
│   ├── ManageFormsView.ts     # View for listing/managing forms
│   └── FormImportView.ts      # Form import/export
├── std/                       # FP utilities (re-exports fp-ts + custom helpers)
│   ├── index.ts               # Main exports: pipe, flow, O, E, A, TE, parse, etc.
│   ├── Array.ts               # Extended array utilities
│   └── TaskEither.ts          # Extended TE utilities
├── suggesters/                # Obsidian modal pickers
├── utils/                     # Logging, errors, file helpers
└── typings/                   # Ambient type declarations
```

Key non-src files:
- `esbuild.config.mjs` — Build configuration
- `manifest.json` / `versions.json` — Obsidian plugin metadata
- `styles.css` — Plugin styles
- `EXAMPLE_VAULT/` — Dev vault for testing (dev mode output target)

## Code Conventions

### TypeScript

- **Strict mode** is on: `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`.
- **Path aliases:** Use `@std` for `src/std` and `@core` for `src/core`.
- **Indent:** 4 spaces (enforced by `.editorconfig`).
- **Print width:** 100 characters (Prettier).
- **Arrow parens:** Always required — `(x) => x`, not `x => x`.
- **Trailing commas:** Always (`"all"`).

### Functional Programming (fp-ts)

This codebase uses fp-ts extensively. Key conventions:

- **Namespace imports** — Import fp-ts modules as single-letter namespaces:
  - `O` = `fp-ts/Option`
  - `E` = `fp-ts/Either`
  - `A` = `fp-ts/Array`
  - `TE` = `fp-ts/TaskEither`
  - `RTE` = `fp-ts/ReaderTaskEither`
  - `S` = `fp-ts/string`
  - `pipe` and `flow` from `@std`
- **No direct library imports** — ESLint rule `fp-ts/no-lib-imports` is enforced. Always use namespace imports (e.g., `O.some(x)` not `import { some } from "fp-ts/Option"`).
- **pipe/flow** for composition — Prefer `pipe(value, fn1, fn2)` over nested calls.
- The `@std` module (`src/std/index.ts`) re-exports fp-ts namespaces and adds custom utilities like `parse`, `parseC`, `trySchemas`, `throttle`, `parseFunctionBody`.

### Svelte Components

- Svelte 4 with `svelte-preprocess` for TypeScript support.
- CSS is injected (not extracted) via esbuild-svelte `css: "injected"`.
- Components live in `src/views/components/Form/` (input renderers) and `src/views/components/FormBuilder/` (form editor UI).
- `RenderField.svelte` acts as a router dispatching to the correct field component based on input type.

### Validation with Valibot

- All form definitions validated via Valibot schemas in `src/core/formDefinitionSchema.ts` and `src/core/input/InputDefinitionSchema.ts`.
- Input types use discriminated unions keyed on `type` field.
- Form migration logic auto-upgrades old form versions; failures produce `MigrationError`.

### Error Handling

- Custom error class: `ModalFormError` (in `src/utils/ModalFormError.ts`).
- fp-ts `Either` and `TaskEither` for recoverable errors.
- `MigrationError` for form schema migration failures.
- `TemplateError` for template parsing/execution failures.

## Architecture Patterns

### Form Definition → Rendering Pipeline

1. **Define**: Forms are JSON objects validated by Valibot (`FormDefinition` type).
2. **Store**: Saved in plugin settings (persisted by Obsidian).
3. **Engine**: `makeFormEngine()` creates reactive Svelte stores for field values, errors, and visibility.
4. **Render**: `FormModal.svelte` → `RenderField.svelte` dispatches to type-specific components.
5. **Result**: Submission returns `FormResult` with methods: `.asFrontmatterString()`, `.asDataviewProperties()`, `.asString(template)`, `.getValue(key)`.

### Input Field Types

`text`, `number`, `date`, `time`, `datetime`, `email`, `tel`, `textarea`, `toggle`, `select`, `multiselect`, `slider`, `tag`, `note`, `folder`, `dataview`, `document_block`, `markdown_block`, `image`, `file`

### Template System

- Syntax: `{{ fieldName }}` for variables, `{{ fieldName | transform }}` for transformations, `{# pick/omit fields #}` for commands.
- Parsed with parser-ts combinators in `src/core/template/templateParser.ts`.
- Two service implementations: `BasicTemplateService` and `TemplaterService` (for Templater plugin integration).

### Public API

The plugin exposes a global API object. Key methods:
- `openForm(name|definition, options)` — Open a form by name or inline definition
- `limitedForm(name, options, formOpts)` — Open with field filtering (pick/omit)
- `builder` — `FormBuilder` instance for fluent form creation

### FormBuilder (Fluent API)

```typescript
new FormBuilder({ name, title, fields: [] })
    .text({ name: "title" })
    .select({ name: "category", options: [...] })
    .build()
```

Each method returns a new `FormBuilder` instance (immutable/functional style).

## Testing

- Tests are colocated with source: `src/**/*.test.ts`
- Jest with ts-jest preset
- Path aliases (`@std`, `@core`) mapped in `jest.config.ts`
- Key test areas: form definition validation, template parsing, form engine state, FormResult formatting, FP utilities
- Run tests before submitting: `npm run test`

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and **release-please** for automated releases. Commit messages **must** follow this format or releases will not be triggered.

### Format

```
<type>: <short description>

<optional body>
```

### Types that trigger a release

| Type | Release | Example |
|------|---------|---------|
| `fix:` | Patch (1.0.x) | `fix: preserve number types in frontmatter output` |
| `feat:` | Minor (1.x.0) | `feat: add form commands for individual forms` |

### Types that do NOT trigger a release

`test:`, `chore:`, `docs:`, `refactor:`, `style:`, `ci:`, `build:`, `perf:`

### Rules

- **One commit per logical change.** Bundle the fix and its tests into a single `fix:` or `feat:` commit. Do not split tests, refactors, or chore tasks into separate commits.
- **No scopes** are used in this project (i.e., `fix:` not `fix(core):`).
- Use `Closes #<issue>` in the commit body to auto-close GitHub issues.
- Do not include PR-style references like `(#123)` in the subject line unless it is an actual PR number added by GitHub.

## CI/CD

- **Pull requests**: GitHub Actions runs `npm run build && npm run test`
- **Releases**: Release-please on push to `master`, uploads `main.js`, `manifest.json`, `styles.css`
- **Version sync**: Automated workflow keeps `manifest.json` and `versions.json` in sync

## Common Pitfalls

- The `build` script includes `check` (lint + svelte-check). Running `npm run build` without fixing lint/type errors will fail.
- fp-ts namespace imports must use the single-letter aliases (`O`, `E`, `A`, etc.) imported from `@std` — direct imports from `fp-ts/*` paths violate the `fp-ts/no-lib-imports` rule.
- Svelte files are not covered by Jest; only `.ts` files have test coverage.
- Dev mode outputs to `EXAMPLE_VAULT/`, not the project root. Production build outputs `main.js` to root.
- The `obsidian` module is external — never bundle it; it's provided by the Obsidian app at runtime.
