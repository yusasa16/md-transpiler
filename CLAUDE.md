# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start <inputFile> [outputFile]` - Convert Markdown file to HTML
- `npm test` - Run test suite with Vitest
- `npm run lint` - Check code quality with Biome
- `npm run lint:fix` - Fix linting issues automatically

### Testing
- Run all tests: `npm test`
- Tests use fixture files in `test/fixture/` directory
- Test files are in `test/` directory using Vitest framework
- Tests validate both plugin functionality and full conversion pipeline

## Architecture

This is a TypeScript Markdown-to-HTML transpiler built on the unified ecosystem with custom HTML wrapping functionality.

### Core Processing Pipeline
The conversion pipeline in `MarkdownToHtmlConverter` follows this chain:
1. `remarkParse` - Parse Markdown
2. `remarkGfm` - GitHub Flavored Markdown support
3. `remarkMath` - Math notation parsing
4. `remarkRehype` - Convert to HTML AST (with `allowDangerousHtml: true`)
5. `rehypeRaw` - Handle raw HTML
6. `rehypeKatex` - Render math with KaTeX
7. `rehypeHighlight` - Syntax highlighting
8. `headings` (custom) - Wrap headings in divs
9. `paragraphs` (custom) - Wrap paragraphs/lists in structured divs
10. `rehypeStringify` - Generate final HTML

### Custom Rehype Plugins
Located in `src/rehype-wrap-element.ts`:

- **headings plugin**: Wraps all heading elements (h1-h6) in `<div class="{tagName}">` containers
- **paragraphs plugin**: Groups consecutive paragraphs into `<div class="one-column">` containers and handles list grouping

The paragraphs plugin has complex logic for:
- Grouping consecutive `<p>` elements
- Grouping consecutive `<ul>`/`<ol>` elements  
- Flushing groups when different element types are encountered
- Recursive processing of nested elements

### Code Style
- Uses Biome for linting/formatting with tab indentation and double quotes
- TypeScript with strict settings
- File I/O uses Node.js fs sync methods

### Key Features
- GitHub Flavored Markdown support (tables, strikethrough, task lists)
- KaTeX math rendering (inline `$...$` and block `$$...$$`)
- Syntax highlighting with automatic language detection
- Raw HTML support with `allowDangerousHtml: true`
- Custom element wrapping for structured output