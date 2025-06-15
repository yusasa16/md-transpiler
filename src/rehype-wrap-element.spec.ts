import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MarkdownToHtmlConverter } from "./md-to-html";
import { clearTemplateCache } from "./template-loader";

describe("rehype-wrap-element with templates", () => {
	const testTemplateDir = "./test-templates-rehype";

	beforeEach(() => {
		// Clear template cache
		clearTemplateCache();

		// Create test template directory structure
		mkdirSync(join(testTemplateDir, "landing-page"), { recursive: true });
		mkdirSync(join(testTemplateDir, "blog"), { recursive: true });

		// Create heading templates
		writeFileSync(
			join(testTemplateDir, "landing-page", "h1.html"),
			`<section class="hero">
  <div class="container">
    {content}
  </div>
</section>`,
		);

		writeFileSync(
			join(testTemplateDir, "landing-page", "h2.html"),
			`<div class="section-header">
  {content}
</div>`,
		);

		// Create paragraph template
		writeFileSync(
			join(testTemplateDir, "landing-page", "p.html"),
			`<div class="paragraph">
  {content}
</div>`,
		);

		// Create list template
		writeFileSync(
			join(testTemplateDir, "landing-page", "ul.html"),
			`<div class="feature-list">
  {content}
</div>`,
		);

		// Create blockquote template
		writeFileSync(
			join(testTemplateDir, "landing-page", "blockquote.html"),
			`<div class="callout callout-info">
  {content}
</div>`,
		);

		// Create blog templates
		writeFileSync(
			join(testTemplateDir, "blog", "h1.html"),
			`<article class="post-title">
  {content}
</article>`,
		);
	});

	afterEach(() => {
		// Clean up test templates
		if (existsSync(testTemplateDir)) {
			rmSync(testTemplateDir, { recursive: true, force: true });
		}
		clearTemplateCache();
	});

	describe("headings template integration", () => {
		it("should use h1 template for landing-page profile", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = "# Welcome to My Site";
			const result = await converter.convert(markdown);

			expect(result).toContain('<section class="hero">');
			expect(result).toContain('<div class="container">');
			expect(result).toContain("<h1>Welcome to My Site</h1>");
		});

		it("should use h2 template for section headers", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = "## About Us";
			const result = await converter.convert(markdown);

			expect(result).toContain('<div class="section-header">');
			expect(result).toContain("<h2>About Us</h2>");
		});

		it("should use different templates for different profiles", async () => {
			const landingConverter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const blogConverter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "blog",
				useTemplates: true,
			});

			const markdown = "# My Title";

			const landingResult = await landingConverter.convert(markdown);
			const blogResult = await blogConverter.convert(markdown);

			expect(landingResult).toContain('<section class="hero">');
			expect(blogResult).toContain('<article class="post-title">');
		});

		it("should fallback to default behavior when no template", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			// h3 doesn't have a template, should use default wrapping
			const markdown = "### Subsection";
			const result = await converter.convert(markdown);

			expect(result).toContain('<div class="h3">');
			expect(result).toContain("<h3>Subsection</h3>");
		});
	});

	describe("paragraphs template integration", () => {
		it("should use paragraph template for single paragraph", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = "This is a test paragraph.";
			const result = await converter.convert(markdown);

			expect(result).toContain('<div class="paragraph">');
			expect(result).toContain("<p>This is a test paragraph.</p>");
		});

		it("should use list template for unordered lists", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = `- Feature 1
- Feature 2
- Feature 3`;
			const result = await converter.convert(markdown);

			expect(result).toContain('<div class="feature-list">');
			expect(result).toContain("<ul>");
			expect(result).toContain("<li>Feature 1</li>");
		});

		it("should use blockquote template", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = "> This is a quote";
			const result = await converter.convert(markdown);

			expect(result).toContain('<div class="callout callout-info">');
			expect(result).toContain("<blockquote>");
			expect(result).toContain("<p>This is a quote</p>");
		});
	});

	describe("template system integration", () => {
		it("should work with complex markdown", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = `# Main Title

This is an introduction paragraph.

## Features

- Easy to use
- Powerful templates
- Flexible configuration

> Important note about the system.`;

			const result = await converter.convert(markdown);

			// Check h1 template
			expect(result).toContain('<section class="hero">');
			expect(result).toContain("<h1>Main Title</h1>");

			// Check h2 template
			expect(result).toContain('<div class="section-header">');
			expect(result).toContain("<h2>Features</h2>");

			// Check paragraph template
			expect(result).toContain('<div class="paragraph">');
			expect(result).toContain("<p>This is an introduction paragraph.</p>");

			// Check list template
			expect(result).toContain('<div class="feature-list">');
			expect(result).toContain("<li>Easy to use</li>");

			// Check blockquote template
			expect(result).toContain('<div class="callout callout-info">');
			expect(result).toContain("<p>Important note about the system.</p>");
		});

		it("should work without templates (legacy mode)", async () => {
			const converter = new MarkdownToHtmlConverter({
				useTemplates: false,
			});

			const markdown = `# Title

Paragraph text.`;

			const result = await converter.convert(markdown);

			// Should use default wrapping
			expect(result).toContain('<div class="h1">');
			expect(result).toContain('<div class="one-column">');
			expect(result).not.toContain('<section class="hero">');
		});

		it("should handle missing template directory gracefully", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: "./nonexistent-templates",
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = "# Title";
			const result = await converter.convert(markdown);

			// Should fallback to default behavior
			expect(result).toContain('<div class="h1">');
			expect(result).toContain("<h1>Title</h1>");
		});
	});

	describe("frontmatter integration", () => {
		it("should extract frontmatter from markdown", async () => {
			const converter = new MarkdownToHtmlConverter({
				templateDir: testTemplateDir,
				profile: "landing-page",
				useTemplates: true,
			});

			const markdown = `---
title: My Page
author: John Doe
---

# Welcome

This is content.`;

			const result = await converter.convert(markdown);

			// Should process content without frontmatter
			expect(result).toContain("<h1>Welcome</h1>");
			expect(result).toContain("<p>This is content.</p>");
			expect(result).not.toContain("title: My Page");
		});
	});
});
