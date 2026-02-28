# Copilot Instructions

This is a VS Code extension written in TypeScript that parses TODO comments from source files and displays them in VS Code's Problems panel.

## Project Structure

- `src/` — Extension source code
  - `classes/` — Core logic classes (Parser, FileReader, UserSettings, Logger, etc.)
  - `types/` — Domain types (TodoType, FileType, LanguageType, etc.)
  - `utils/` — Utility helpers
  - `const/` — Constants
- `test/` — Mocha tests mirroring the `src/` structure
- `built_packages/` — Pre-built `.vsix` packages

## Build & Test

- **Build:** `npm run vscode:prepublish` (requires Node 6 via `.nvmrc`)
- **Test:** `npm test` (runs Mocha tests inside the VS Code test runner)
- **Compile (watch):** `npm run compile`

> **Important:** Use Node 6 (see `.nvmrc`). Running on Node 12+ causes a `primordials` error due to legacy gulp dependencies bundled with the `vscode` npm package.

## Conventions

- Use the `Logger` class (`src/classes/Logger.ts`) for logging — `Logger.log()`, `Logger.warn()`, `Logger.error()`.
- Promises that can fail should always call `reject()` rather than silently returning.
- Getters should always be invoked as methods (e.g. `this.getContent()`, not `this.getContent`).
- Error catch blocks must never be empty — log errors with `Logger.error(e)`.
