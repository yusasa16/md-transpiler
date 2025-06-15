import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	clearTemplateCache,
	getTemplateCacheStats,
	loadAllTemplates,
	loadTemplate,
	validateTemplateSyntax,
} from "./template-loader";

describe("template-loader", () => {
	const testTemplateDir = "./test-templates";

	beforeEach(() => {
		// Clear cache before each test
		clearTemplateCache();

		// Create test template directory structure
		mkdirSync(join(testTemplateDir, "landing-page"), { recursive: true });
		mkdirSync(join(testTemplateDir, "blog"), { recursive: true });

		// Create test templates
		writeFileSync(
			join(testTemplateDir, "landing-page", "h1.html"),
			`<section class="hero">
  <div class="container">
    <h1>{content}</h1>
  </div>
</section>`,
		);

		writeFileSync(
			join(testTemplateDir, "landing-page", "p.html"),
			`<div class="paragraph">
  <p>{content}</p>
</div>`,
		);

		writeFileSync(
			join(testTemplateDir, "blog", "h1.html"),
			`<article class="post-title">
  <h1>{content}</h1>
</article>`,
		);

		// Create invalid template (missing {content})
		writeFileSync(
			join(testTemplateDir, "landing-page", "invalid.html"),
			`<div class="invalid">No content placeholder</div>`,
		);
	});

	afterEach(() => {
		// Clean up test templates
		if (existsSync(testTemplateDir)) {
			rmSync(testTemplateDir, { recursive: true, force: true });
		}
		// Clear cache after each test
		clearTemplateCache();
	});

	describe("loadTemplate", () => {
		it("should load existing template", () => {
			const template = loadTemplate("landing-page", "h1", testTemplateDir);

			expect(template).toBeTruthy();
			expect(template).toContain("hero");
			expect(template).toContain("{content}");
		});

		it("should return null for non-existent template", () => {
			const template = loadTemplate(
				"landing-page",
				"nonexistent",
				testTemplateDir,
			);

			expect(template).toBeNull();
		});

		it("should return null for non-existent profile", () => {
			const template = loadTemplate("nonexistent", "h1", testTemplateDir);

			expect(template).toBeNull();
		});

		it("should cache loaded templates", () => {
			const template1 = loadTemplate("landing-page", "h1", testTemplateDir);
			const template2 = loadTemplate("landing-page", "h1", testTemplateDir);

			expect(template1).toBe(template2);

			const stats = getTemplateCacheStats();
			expect(stats.size).toBeGreaterThan(0);
			expect(stats.keys.some((key) => key.includes("landing-page:h1"))).toBe(
				true,
			);
		});

		it("should handle different profiles", () => {
			const landingTemplate = loadTemplate(
				"landing-page",
				"h1",
				testTemplateDir,
			);
			const blogTemplate = loadTemplate("blog", "h1", testTemplateDir);

			expect(landingTemplate).toContain("hero");
			expect(blogTemplate).toContain("post-title");
			expect(landingTemplate).not.toBe(blogTemplate);
		});

		it("should handle different template directories", () => {
			const template1 = loadTemplate("landing-page", "h1", testTemplateDir);
			const template2 = loadTemplate("landing-page", "h1", "./different-dir");

			expect(template1).toBeTruthy();
			expect(template2).toBeNull();

			const stats = getTemplateCacheStats();
			expect(stats.keys.some((key) => key.includes(testTemplateDir))).toBe(
				true,
			);
			expect(stats.keys.some((key) => key.includes("./different-dir"))).toBe(
				true,
			);
		});
	});

	describe("validateTemplateSyntax", () => {
		it("should validate correct template", () => {
			const validTemplate = `<div class="wrapper"><p>{content}</p></div>`;

			expect(validateTemplateSyntax(validTemplate)).toBe(true);
		});

		it("should reject template without {content}", () => {
			const invalidTemplate = `<div class="wrapper"><p>No placeholder</p></div>`;

			expect(validateTemplateSyntax(invalidTemplate)).toBe(false);
		});

		it("should reject template without HTML tags", () => {
			const invalidTemplate = "Just text with {content}";

			expect(validateTemplateSyntax(invalidTemplate)).toBe(false);
		});

		it("should handle invalid template files", () => {
			const template = loadTemplate("landing-page", "invalid", testTemplateDir);

			expect(template).toBeNull();
		});
	});

	describe("loadAllTemplates", () => {
		it("should load all available templates for a profile", () => {
			const templates = loadAllTemplates("landing-page", testTemplateDir);

			expect(templates.size).toBeGreaterThan(0);
			expect(templates.has("h1")).toBe(true);
			expect(templates.has("p")).toBe(true);
			expect(templates.get("h1")).toContain("hero");
		});

		it("should return empty map for non-existent profile", () => {
			const templates = loadAllTemplates("nonexistent", testTemplateDir);

			expect(templates.size).toBe(0);
		});

		it("should use default template directory", () => {
			// This will return empty since there's no ./templates directory
			const templates = loadAllTemplates("landing-page");

			expect(templates.size).toBe(0);
		});
	});

	describe("cache management", () => {
		it("should clear cache", () => {
			loadTemplate("landing-page", "h1", testTemplateDir);
			expect(getTemplateCacheStats().size).toBeGreaterThan(0);

			clearTemplateCache();
			expect(getTemplateCacheStats().size).toBe(0);
		});

		it("should provide cache statistics", () => {
			loadTemplate("landing-page", "h1", testTemplateDir);
			loadTemplate("blog", "h1", testTemplateDir);

			const stats = getTemplateCacheStats();
			expect(stats.size).toBe(2);
			expect(stats.keys.some((key) => key.includes("landing-page:h1"))).toBe(
				true,
			);
			expect(stats.keys.some((key) => key.includes("blog:h1"))).toBe(true);
		});
	});
});
