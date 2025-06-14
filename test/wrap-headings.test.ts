import { describe, expect, it } from "vitest";
import { MarkdownToHtmlConverter } from "../src/md-to-html";

describe("rehypeWrapHeadings", () => {
	const converter = new MarkdownToHtmlConverter();

	it("should wrap h2 heading with div", async () => {
		const markdown = "## Hello World!";
		const result = await converter.convert(markdown);

		expect(result).toContain('<div class="h2"><h2>Hello World!</h2></div>');
	});

	it("should wrap h1 heading with div", async () => {
		const markdown = "# Main Title";
		const result = await converter.convert(markdown);

		expect(result).toContain('<div class="h1"><h1>Main Title</h1></div>');
	});

	it("should wrap h3 heading with div", async () => {
		const markdown = "### Subtitle";
		const result = await converter.convert(markdown);

		expect(result).toContain('<div class="h3"><h3>Subtitle</h3></div>');
	});

	it("should wrap multiple headings", async () => {
		const markdown = `# Title
## Subtitle
### Section`;
		const result = await converter.convert(markdown);

		expect(result).toContain('<div class="h1"><h1>Title</h1></div>');
		expect(result).toContain('<div class="h2"><h2>Subtitle</h2></div>');
		expect(result).toContain('<div class="h3"><h3>Section</h3></div>');
	});

	it("should not affect non-heading elements", async () => {
		const markdown = "This is a paragraph.";
		const result = await converter.convert(markdown);

		expect(result).toContain("<p>This is a paragraph.</p>");
		// 段落プラグインにより、段落もdivでラップされるようになったため、このテストを更新
		expect(result).toContain('<div class="paragraph">');
	});
});
