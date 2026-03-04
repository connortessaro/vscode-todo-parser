# Copilot Instructions for `vscode-todo-parser`

## Build, test, and lint commands

- Install deps: `npm install`
- Build TypeScript: `npm run compile`
- Watch mode: `npm run watch`
- Lint: `npm run lint`
- Full tests (as configured): `npm test` (runs `pretest` first: compile + lint)
- Single test (no dedicated script): compile first, then run Mocha with a grep filter on compiled tests, for example:  
  `npm run compile && npx mocha "out/test/**/*.test.js" --grep "LanguageType"`

## High-level architecture

- Extension entry is `src/extension.ts`, which instantiates `Main` (`src/main.ts`) on activation.
- `Main` wires `CommandListener.listen(...)` to `process(...)`; commands are class-based objects (`src/types/CommandType.ts`) implementing `execute(): Promise<any>`.
- `CommandListener` maps VS Code command IDs/events to command classes (`ParseCurrentFileCommand`, `ParseAllFilesCommand`, `UpdateStatusBarCommand`, etc.).
- Parse flow:
  1. `FileReader` loads current file or recursively scans project files in chunks (`READ_FILE_CHUNK_SIZE`), with cancellation support.
  2. `FileFilter` applies user include/exclude rules.
  3. `Parser` runs language regex steps and refines matches using configured markers.
  4. `OutputWriter` writes results either to the `todo_parser` output channel or VS Code diagnostics (Problems), depending on settings.
- UI feedback:
  - `StatusBarManager` owns the status bar item.
  - `ParseAllFilesCommand` updates progress text and binds cancel behavior through `extension.cancelParseAllFiles`.

## Key conventions in this repository

- **Settings are centralized in `UserSettings` (singleton)** (`src/classes/UserSettings.ts`); always use `UserSettings.getInstance()` instead of reading workspace config directly in feature code.
- **Setting precedence is intentional**:
  - `include` overrides `exclude`
  - `only` scopes root paths
  - `autoDefaultMarkers` appends `TODO` automatically
- **Output writing is stateful** (`OutputWriter.begin()` → `writeTodo(...)` → `finish(...)`); command implementations follow this lifecycle.
- **Commands return promises and are dispatched through `CommandHandler`** instead of invoking class internals directly.
- **Language support is regex-driven**:
  - Add/adjust regex in `src/const/RegexStrings.ts`
  - Register language in `src/types/LanguageType.ts` (`LanguageName` static entries)
- Tests are TypeScript tests under `test/**/*.test.ts`; many tests rely on sample fixtures under `test/sample-code-files` and temporary directories under `test/**/temp`.
- From `README_DEV.md`: CI/test environments expect `CODE_TESTS_WORKSPACE=./test`.
