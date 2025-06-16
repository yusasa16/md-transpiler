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

This is a TypeScript Markdown-to-HTML transpiler built on the unified ecosystem with custom HTML wrapping functionality and template system.

### Core Processing Pipeline
The conversion pipeline in `MarkdownToHtmlConverter` follows this chain:
1. `remarkParse` - Parse Markdown
2. `remarkGfm` - GitHub Flavored Markdown support
3. `remarkMath` - Math notation parsing (line 51)
4. `remarkRehype` - Convert to HTML AST (with `allowDangerousHtml: true`)
5. `rehypeRaw` - Handle raw HTML
6. `rehypeKatex` - Render math with KaTeX (line 54)
7. `rehypeHighlight` - Syntax highlighting
8. `headings` (custom) - Wrap headings in divs with template support
9. `paragraphs` (custom) - Wrap paragraphs/lists in structured divs with template support
10. `rehypeStringify` - Generate final HTML

### HTML Template System
- Multiple profiles: default, landing-page, blog, docs
- Template files with `{content}` placeholders in `templates/` directory
- CLI options: `--template-dir`, `--profile`, `--no-templates`
- Template validation ensures HTML tags and `{content}` placeholder presence
- Template caching for performance

### Custom Rehype Plugins
Located in `src/rehype-wrap-element.ts`:

- **headings plugin**: Wraps all heading elements (h1-h6) in template-based containers or `<div class="{tagName}">`
- **paragraphs plugin**: Groups consecutive paragraphs into template-based containers or `<div class="one-column">`

The paragraphs plugin has complex logic for:
- Grouping consecutive `<p>` elements
- Grouping consecutive `<ul>`/`<ol>` elements  
- Flushing groups when different element types are encountered
- Recursive processing of nested elements
- Template application or fallback div wrapping

### Math Rendering Implementation
- **remarkMath** plugin (src/md-to-html.ts:51) - Parses LaTeX math syntax
- **rehypeKatex** plugin (src/md-to-html.ts:54) - Renders math with KaTeX
- Supports inline `$E = mc^2$` and block `$$...$$` math expressions
- Fully integrated in unified processing pipeline

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
- Multi-profile HTML template system