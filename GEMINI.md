# Gemini Project Analysis: md-transpiler

## Project Overview

This project is a command-line Markdown to HTML transpiler built with TypeScript and Node.js. Its core feature is a flexible templating system that allows users to define custom HTML structures for different Markdown elements on a per-profile basis (e.g., for a blog, documentation, or a landing page). It leverages the `unified` ecosystem, using `remark` for Markdown parsing and `rehype` for HTML processing, to create a powerful and extensible conversion pipeline.

## Core Technologies

- **Language:** TypeScript
- **Runtime:** Node.js
- **Package Manager:** npm
- **Markdown/HTML Processing:** `unified`, `remark`, `rehype`
- **Testing Framework:** `vitest`
- **Linter & Formatter:** `biome`
- **CLI Entry Point Runner:** `jiti`

## Project Structure

```
/
├── src/                      # Main source code
│   ├── index.ts              # CLI entry point
│   ├── cli.ts                # Command-line interface logic (argument parsing)
│   ├── md-to-html.ts         # Core Markdown to HTML conversion logic
│   ├── template-loader.ts    # Loads HTML templates from the filesystem
│   ├── placeholder-replacer.ts # Handles the `{content}` placeholder in templates
│   └── rehype-wrap-element.ts# Custom rehype plugin to wrap elements with template HTML
├── templates/                # Contains HTML template files organized by profile
│   ├── default/
│   ├── blog/
│   └── ...
├── test/                     # Test files for the `src` code
├── package.json              # Project dependencies and scripts
├── biome.json                # Configuration for the Biome linter/formatter
└── README.md                 # Detailed user-facing documentation
```

## Key Workflows

The project's scripts are defined in `package.json`.

### Running the Transpiler

The main application logic is executed via the `start` script. It takes an input Markdown file and optional arguments.

- **Command:** `npm start <inputFile> [outputFile] [options]`
- **Example:** `npm start README.md --profile blog`

### Running Tests

The project uses `vitest` for testing.

- **Command:** `npm test`

### Linting and Formatting

Code quality is maintained by `biome`.

- **Check for issues:** `npm run lint`
- **Fix issues automatically:** `npm run lint:fix`

## Architectural Notes

The conversion process follows a pipeline architecture established by `unified`:

1.  **Parse:** `remark-parse` converts the input Markdown string into a syntax tree (MDAST).
2.  **Transform (Markdown):** `remark-gfm` and `remark-math` plugins add support for their respective features to the MDAST.
3.  **Convert to HTML AST:** `remark-rehype` transforms the MDAST into an HTML syntax tree (HAST).
4.  **Transform (HTML):**
    *   Custom plugins like `rehype-wrap-element` apply the HTML templates.
    *   Other `rehype` plugins (`rehype-raw`, `rehype-highlight`, `rehype-katex`) process the HAST to add syntax highlighting, render math formulas, etc.
5.  **Stringify:** `rehype-stringify` converts the final HAST into an HTML string.

This modular approach makes it easy to add or modify features by adding or configuring plugins in the pipeline.
