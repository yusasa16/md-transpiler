import { describe, expect, it } from "vitest";
import {
	type PlaceholderContext,
	escapeHtml,
	extractFrontmatter,
	getNestedValue,
	parseSimpleYaml,
	replaceFrontmatterPlaceholders,
	replacePlaceholders,
	stringifyAttributes,
} from "./placeholder-replacer";

describe("placeholder-replacer", () => {
	describe("replacePlaceholders", () => {
		it("should replace {content} placeholder", () => {
			const template = "<div class='wrapper'>{content}</div>";
			const context: PlaceholderContext = {
				content: "<h1>Hello World</h1>",
				escapeContent: false, // For this test, we want the HTML to be preserved
			};

			const result = replacePlaceholders(template, context);

			expect(result).toBe("<div class='wrapper'><h1>Hello World</h1></div>");
		});

		it("should replace {attributes} placeholder", () => {
			const template = "<div {attributes}>{content}</div>";
			const context: PlaceholderContext = {
				content: "Hello",
				attributes: {
					id: "test-id",
					class: ["btn", "primary"],
					"data-value": "123",
				},
			};

			const result = replacePlaceholders(template, context);

			expect(result).toContain('id="test-id"');
			expect(result).toContain('class="btn primary"');
			expect(result).toContain('data-value="123"');
			expect(result).toContain("Hello");
		});

		it("should replace {id} and {class} placeholders", () => {
			const template = "<div id='{id}' class='wrapper {class}'>{content}</div>";
			const context: PlaceholderContext = {
				content: "Hello",
				id: "my-element",
				className: ["active", "highlighted"],
			};

			const result = replacePlaceholders(template, context);

			expect(result).toBe(
				"<div id='my-element' class='wrapper active highlighted'>Hello</div>",
			);
		});

		it("should handle missing placeholders gracefully", () => {
			const template = "<div id='{id}' class='{class}'>{content}</div>";
			const context: PlaceholderContext = {
				content: "Hello",
			};

			const result = replacePlaceholders(template, context);

			expect(result).toBe("<div id='' class=''>Hello</div>");
		});

		it("should replace frontmatter placeholders", () => {
			const template =
				"<h1>{frontmatter.title}</h1><p>{frontmatter.author.name}</p>";
			const context: PlaceholderContext = {
				content: "Body content",
				frontmatter: {
					title: "My Post",
					author: {
						name: "John Doe",
					},
				},
			};

			const result = replacePlaceholders(template, context);

			expect(result).toBe("<h1>My Post</h1><p>John Doe</p>");
		});

		it("should escape content by default for security", () => {
			const template = "<div>{content}</div>";
			const context: PlaceholderContext = {
				content: '<script>alert("XSS")</script>',
			};

			const result = replacePlaceholders(template, context);

			expect(result).toBe(
				"<div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;</div>",
			);
		});

		it("should allow opt-out of content escaping for trusted content", () => {
			const template = "<div>{content}</div>";
			const context: PlaceholderContext = {
				content: "<strong>Trusted HTML</strong>",
				escapeContent: false,
			};

			const result = replacePlaceholders(template, context);

			expect(result).toBe("<div><strong>Trusted HTML</strong></div>");
		});

		it("should escape content when escapeContent is explicitly true", () => {
			const template = "<div>{content}</div>";
			const context: PlaceholderContext = {
				content: '<img src="x" onerror="alert(1)">',
				escapeContent: true,
			};

			const result = replacePlaceholders(template, context);

			expect(result).toBe(
				"<div>&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;</div>",
			);
		});

		it("should handle multiple XSS vectors in content", () => {
			const template = "<div>{content}</div>";
			const maliciousContent = [
				'<script>alert("xss")</script>',
				'<img src="x" onerror="alert(1)">',
				'javascript:alert("xss")',
				'<iframe src="javascript:alert(1)"></iframe>',
			].join("");

			const context: PlaceholderContext = {
				content: maliciousContent,
			};

			const result = replacePlaceholders(template, context);

			// Should not contain any unescaped < > " ' characters
			expect(result).not.toContain("<script");
			expect(result).not.toContain("<img");
			expect(result).not.toContain("<iframe");
			expect(result).toContain("&lt;");
			expect(result).toContain("&gt;");
			expect(result).toContain("&quot;");
		});
	});

	describe("stringifyAttributes", () => {
		it("should convert properties to attribute string", () => {
			const properties = {
				id: "test-id",
				class: ["btn", "primary"],
				"data-value": "123",
				disabled: true,
				hidden: false,
			};

			const result = stringifyAttributes(properties);

			expect(result).toContain('id="test-id"');
			expect(result).toContain('class="btn primary"');
			expect(result).toContain('data-value="123"');
			expect(result).toContain("disabled");
			expect(result).not.toContain("hidden");
		});

		it("should handle empty properties", () => {
			const result = stringifyAttributes({});

			expect(result).toBe("");
		});

		it("should handle null and undefined values", () => {
			const properties = {
				id: "test",
				nullValue: null,
				undefinedValue: undefined,
			};

			const result = stringifyAttributes(properties);

			expect(result).toBe('id="test"');
		});
	});

	describe("replaceFrontmatterPlaceholders", () => {
		it("should replace simple frontmatter placeholders", () => {
			const template =
				"Title: {frontmatter.title}, Author: {frontmatter.author}";
			const frontmatter = {
				title: "My Blog Post",
				author: "Jane Doe",
			};

			const result = replaceFrontmatterPlaceholders(template, frontmatter);

			expect(result).toBe("Title: My Blog Post, Author: Jane Doe");
		});

		it("should replace nested frontmatter placeholders", () => {
			const template =
				"Author: {frontmatter.author.name} ({frontmatter.author.email})";
			const frontmatter = {
				author: {
					name: "John Smith",
					email: "john@example.com",
				},
			};

			const result = replaceFrontmatterPlaceholders(template, frontmatter);

			expect(result).toBe("Author: John Smith (john@example.com)");
		});

		it("should handle missing frontmatter keys", () => {
			const template =
				"Title: {frontmatter.title}, Missing: {frontmatter.missing}";
			const frontmatter = {
				title: "Existing Title",
			};

			const result = replaceFrontmatterPlaceholders(template, frontmatter);

			expect(result).toBe("Title: Existing Title, Missing: ");
		});
	});

	describe("getNestedValue", () => {
		it("should get nested values with dot notation", () => {
			const obj = {
				author: {
					name: "John Doe",
					contact: {
						email: "john@example.com",
					},
				},
			};

			expect(getNestedValue(obj, "author.name")).toBe("John Doe");
			expect(getNestedValue(obj, "author.contact.email")).toBe(
				"john@example.com",
			);
		});

		it("should return undefined for missing paths", () => {
			const obj = { title: "Test" };

			expect(getNestedValue(obj, "missing.path")).toBeUndefined();
			expect(getNestedValue(obj, "title.missing")).toBeUndefined();
		});
	});

	describe("escapeHtml", () => {
		it("should escape HTML characters", () => {
			const dangerous = '<script>alert("xss")</script>';

			const result = escapeHtml(dangerous);

			expect(result).toBe(
				"&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;",
			);
		});

		it("should escape all dangerous characters", () => {
			const text = "&<>\"'/";

			const result = escapeHtml(text);

			expect(result).toBe("&amp;&lt;&gt;&quot;&#x27;&#x2F;");
		});

		it("should leave safe text unchanged", () => {
			const safeText = "Hello World 123";

			const result = escapeHtml(safeText);

			expect(result).toBe(safeText);
		});
	});

	describe("extractFrontmatter", () => {
		it("should extract YAML frontmatter", () => {
			const markdown = `---
title: My Blog Post
author: John Doe
published: true
views: 150
---

# Hello World

This is the content.`;

			const result = extractFrontmatter(markdown);

			expect(result.frontmatter.title).toBe("My Blog Post");
			expect(result.frontmatter.author).toBe("John Doe");
			expect(result.frontmatter.published).toBe(true);
			expect(result.frontmatter.views).toBe(150);
			expect(result.content).toContain("# Hello World");
		});

		it("should handle markdown without frontmatter", () => {
			const markdown = "# Hello World\n\nNo frontmatter here.";

			const result = extractFrontmatter(markdown);

			expect(result.frontmatter).toEqual({});
			expect(result.content).toBe(markdown);
		});

		it("should handle malformed frontmatter", () => {
			const markdown = `---
invalid yaml: [unclosed
---

Content here.`;

			const result = extractFrontmatter(markdown);

			// Simple parser will parse what it can
			expect(result.frontmatter).toEqual({ "invalid yaml": "[unclosed" });
			expect(result.content).toBe("Content here.");
		});
	});

	describe("parseSimpleYaml", () => {
		it("should parse basic key-value pairs", () => {
			const yaml = `title: My Post
author: John Doe
published: true
views: 150
rating: 4.5`;

			const result = parseSimpleYaml(yaml);

			expect(result.title).toBe("My Post");
			expect(result.author).toBe("John Doe");
			expect(result.published).toBe(true);
			expect(result.views).toBe(150);
			expect(result.rating).toBe(4.5);
		});

		it("should handle quoted values", () => {
			const yaml = `title: "Quoted Title"
description: 'Single quoted'
number: "123"`;

			const result = parseSimpleYaml(yaml);

			expect(result.title).toBe("Quoted Title");
			expect(result.description).toBe("Single quoted");
			expect(result.number).toBe(123);
		});

		it("should ignore comments and empty lines", () => {
			const yaml = `# This is a comment
title: Test

# Another comment
author: John`;

			const result = parseSimpleYaml(yaml);

			expect(result.title).toBe("Test");
			expect(result.author).toBe("John");
			expect(Object.keys(result)).toHaveLength(2);
		});
	});
});
