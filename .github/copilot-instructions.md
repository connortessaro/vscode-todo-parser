# Copilot Instructions for vscode-todo-parser

## Project Overview

This is a **Visual Studio Code extension** written in **TypeScript** that parses TODO comments in source code files. It supports single-line and multi-line comments across many languages and can display results in the Output panel or the Problems panel.

## Tech Stack

- **Language**: TypeScript (compiled to ES5 via `tsc`)
- **Runtime**: Node.js (VS Code extension host)
- **Extension API**: `vscode` module (VS Code Extension API)
- **Testing**: Mocha (via `vscode` test runner)
- **CI**: Travis CI (`.travis.yml`)

## Repository Structure

```
src/
  extension.ts        # Extension entry point (activate/deactivate)
  main.ts             # Main class that wires up commands and handlers
  classes/            # Core logic classes (Parser, FileReader, UserSettings, etc.)
  types/              # TypeScript type/enum definitions
  utils/              # Utility helpers
  const/              # Constants
test/
  extension.test.ts   # Mocha test suite entry point
  classes/            # Tests for core classes
  types/              # Tests for types
  utils/              # Tests for utilities
  sample-code-files/  # Sample source files used as test fixtures
```

## Build & Test Commands

```bash
# Install dependencies
npm install

# Compile the extension
npm run vscode:prepublish

# Watch mode (compile on change)
npm run compile

# Run tests
npm test
```

## Coding Conventions

- **TypeScript**: All source files use TypeScript with `commonjs` modules targeting ES5.
- **Imports**: Use named imports (`import {Foo} from './foo'`). Avoid default exports.
- **Classes**: Prefer class-based design consistent with existing classes in `src/classes/`.
- **Async**: Use Promises (not `async/await`) to stay consistent with existing code style.
- **Naming**: Use PascalCase for classes/types, camelCase for variables/functions.
- **No semicolons omitted**: Always terminate statements with semicolons.
- **Error handling**: Log errors through `Logger` (in `src/classes/Logger.ts`); do not use `console.log` directly.

## Key Classes

- `Parser` — Responsible for extracting TODO markers from file content.
- `FileReader` — Reads files from the workspace.
- `FileFilter` — Filters files based on user settings (include/exclude patterns).
- `CommandHandler` — Dispatches commands (`parseAllFiles`, `parseCurrentFile`).
- `UserSettings` — Singleton that reads extension configuration from VS Code settings.
- `OutputWriter` — Writes results to the VS Code Output channel.
- `StatusBarManager` — Updates the TODO counter in the status bar.

## Extension Settings

User-configurable settings live under the `TodoParser` key in VS Code settings:

| Setting | Description |
|---|---|
| `markers` | Array of TODO marker strings or `[marker, priority]` tuples |
| `include` | File extensions to include |
| `exclude` | File extensions to exclude |
| `folderExclude` | Folder names to exclude |
| `only` | Folder paths to focus on |
| `showInProblems` | Show results in Problems panel instead of Output panel |
| `autoDefaultMarkers` | Automatically include the default "TODO" marker |

## Testing Guidelines

- Tests use the **Mocha** framework via the VS Code test runner.
- Test fixtures (sample source files) live in `test/sample-code-files/`. Each fixture file must begin with two lines specifying the language's comment syntax (single-line and block-comment delimiters).
- Add new test cases in the relevant file under `test/classes/`, `test/types/`, or `test/utils/`.
- Run `npm test` to execute the full test suite.
