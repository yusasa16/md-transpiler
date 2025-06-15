# HTML Templates

This directory contains example HTML template sets for different website types. Each template set demonstrates a different styling approach and use case.

## Template Structure

Templates use the `{content}` placeholder, which gets replaced with the actual content from your Markdown file. Content is HTML-escaped by default for security.

## Available Template Sets

### Landing Page (`landing-page/`)
Designed for marketing and promotional websites with emphasis on visual appeal and conversion.

- **`h1.html`** - Hero sections with prominent styling
- **`h2.html`** - Section headers for different page areas
- **`p.html`** - Styled paragraphs with emphasis on readability
- **`ul.html`** - Feature lists and bullet points
- **`blockquote.html`** - Callout boxes for important information

**Usage:**
```bash
npm start document.md --profile landing-page
```

### Blog (`blog/`)
Optimized for article content with focus on readability and clean typography.

- **`h1.html`** - Article titles with proper semantic structure
- **`h2.html`** - Article subheadings for content organization
- **`p.html`** - Article paragraphs with optimal line spacing
- **`code.html`** - Code blocks with syntax highlighting support
- **`blockquote.html`** - Quotes and citations

**Usage:**
```bash
npm start article.md --profile blog
```

### Documentation (`docs/`)
Structured for technical documentation with clear hierarchy and information boxes.

- **`h1.html`** - Page titles with consistent branding
- **`h2.html`** - Section headers for topic organization
- **`blockquote.html`** - Warning/info boxes for important notes
- **`ul.html`** - Structured lists for procedures and features

**Usage:**
```bash
npm start guide.md --profile docs
```

## Creating Custom Templates

1. Create a new directory in `templates/` with your profile name
2. Add HTML template files for the elements you want to customize
3. Use `{content}` placeholder where the content should be inserted
4. Use your profile with `--profile your-profile-name`

### Template Naming

Templates should be named after the HTML element they target:
- `h1.html`, `h2.html`, `h3.html` - Headings
- `p.html` - Paragraphs
- `ul.html`, `ol.html` - Lists
- `blockquote.html` - Blockquotes
- `code.html` - Code blocks

### Security Note

Content is automatically HTML-escaped for security. If you need to insert trusted HTML content, you can disable escaping by using the `escapeContent: false` option in your converter configuration.

## Examples

### Basic Usage
```bash
# Use default templates
npm start document.md

# Use specific template profile
npm start document.md --profile blog

# Use custom template directory
npm start document.md --template-dir ./my-templates --profile custom

# Disable templates entirely
npm start document.md --no-templates
```

### Template Customization
```html
<!-- Example: Custom h1 template -->
<div class="my-custom-header">
  <h1 class="title-style">{content}</h1>
  <div class="header-decoration"></div>
</div>
```

This will wrap all H1 elements in your Markdown with the custom HTML structure while preserving the heading content.