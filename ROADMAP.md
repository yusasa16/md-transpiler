# Roadmap: Flexible Website Sub-Page Generator

## Vision
Transform this md-transpiler into a powerful tool for effortless website sub-page creation by providing highly customizable HTML wrapping for any Markdown element, eliminating repetitive HTML coding.

## Current State
- ✅ Basic Markdown → HTML conversion with unified ecosystem
- ✅ Custom heading wrapper (`<div class="h1"><h1>...</h1></div>`)
- ✅ Paragraph grouping (`<div class="one-column"><p>...</p></div>`)
- ✅ GitHub Flavored Markdown, math rendering, syntax highlighting
- ✅ CLI interface with basic file processing

## Phase 1: HTML Template System 🎯
**Goal**: Make element wrapping completely customizable with HTML template files

### Features
- **HTML template files** - one file per Markdown element type
- **Template directory structure** for different website profiles
- **Simple HTML editing** with syntax highlighting in any editor
- **Placeholder system** for content injection (`{content}`, `{attributes}`, etc.)

### Implementation Tasks
- [ ] Create template file loader (`template-loader.ts`)
- [ ] Design placeholder replacement system
- [ ] Extend rehype plugins to use HTML templates
- [ ] Add CLI option for template directory path
- [ ] Create example template sets for common website types

### Template Directory Structure
```
templates/
├── landing-page/           # Profile for landing pages
│   ├── h1.html            # Hero sections
│   ├── h2.html            # Section headers
│   ├── p.html             # Paragraph styling
│   ├── ul.html            # Feature lists
│   └── blockquote.html    # Callouts
├── blog/                  # Profile for blog posts
│   ├── h1.html            # Article titles
│   ├── h2.html            # Subheadings
│   ├── p.html             # Article paragraphs
│   └── code.html          # Code blocks
└── docs/                  # Profile for documentation
    ├── h1.html            # Page titles
    ├── h2.html            # Section headers
    └── blockquote.html    # Warning boxes
```

### Example Template Files

**templates/landing-page/h1.html:**
```html
<section class="hero">
  <div class="container">
    <h1 class="hero-title">{content}</h1>
  </div>
</section>
```

**templates/landing-page/p.html:**
```html
<div class="paragraph">
  <p>{content}</p>
</div>
```

**templates/blog/blockquote.html:**
```html
<div class="callout callout-info">
  <blockquote>{content}</blockquote>
</div>
```

## Phase 2: Advanced Wrapping Logic 🚀
**Goal**: Intelligent, context-aware element wrapping

### Features
- **Conditional wrappers** based on content patterns, position, or siblings
- **Multi-level nesting** support for complex layouts
- **Context-aware wrapping** (different styles for same element in different sections)
- **CSS class injection** based on content analysis
- **Element grouping rules** (consecutive elements → container)

### Implementation Tasks
- [ ] Develop condition evaluation system
- [ ] Add position/sibling detection in rehype plugins
- [ ] Create content pattern matching
- [ ] Implement nested wrapper support
- [ ] Add automatic CSS class generation

### Example Advanced Templates

**templates/landing-page/h2.default.html:**
```html
<div class="subtitle">
  <h2>{content}</h2>
</div>
```

**templates/landing-page/h2.first-in-section.html:**
```html
<div class="section-title">
  <h2>{content}</h2>
</div>
```

**templates/landing-page/h2.has-code-block.html:**
```html
<div class="technical-section">
  <h2>{content}</h2>
</div>
```

## Phase 3: Website-Specific Features 🌐
**Goal**: Complete website generation capabilities

### Features
- **Layout templates** with header/footer/navigation structure
- **Component generation** (cards, galleries, hero sections, feature blocks)
- **SEO optimization** (automatic meta tags, structured data, Open Graph)
- **Asset handling** (image optimization, CSS/JS injection, font loading)
- **Multi-page site generation** with navigation links

### Implementation Tasks
- [ ] Create layout template system
- [ ] Add component library with pre-built patterns
- [ ] Implement SEO metadata injection
- [ ] Add asset pipeline integration
- [ ] Create site structure management

### Example Layout Template

**templates/landing-page/_layout.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{frontmatter.title} | My Website</title>
  <meta name="description" content="{frontmatter.description}">
</head>
<body>
  <nav class="navbar">
    {nav}
  </nav>
  <main>
    {content}
  </main>
  <footer class="footer">
    {footer}
  </footer>
</body>
</html>
```

## Phase 4: Developer Experience 🛠️
**Goal**: Streamlined development workflow

### Features
- **Live preview** with hot reload during development
- **Theme presets** for common website types
- **Bulk processing** for entire directory structures
- **Build system integration** (Vite, Webpack, etc.)
- **VS Code extension** for config editing and preview

### Implementation Tasks
- [ ] Add file watching and hot reload
- [ ] Create theme preset library
- [ ] Implement batch processing
- [ ] Add build tool plugins
- [ ] Develop VS Code extension

## Success Metrics
- **Reduce sub-page coding time** from hours to minutes
- **Anyone can understand** how to modify templates
- **No learning curve** - just edit HTML files
- **Support multiple website styles** by switching template folders
- **Maintain high performance** even with complex transformations

## Technical Architecture Goals
- **Simple template system** - easy to understand and extend
- **Zero configuration** - works out of the box
- **Backward compatibility** with existing functionality
- **Performance optimization** for large sites
- **Comprehensive testing** for all transformation scenarios

## Core Philosophy
- **Simplicity over features** - easy to explain and use
- **Visual editing** - see exactly what you're creating
- **No magic** - one template file = one element transformation
- **Copy-paste friendly** - duplicate and modify templates easily