import { describe, expect, it } from "vitest";
import { MarkdownToHtmlConverter } from "../src/md-to-html";

describe("paragraphs wrapping", () => {
	const converter = new MarkdownToHtmlConverter();

	it("should wrap consecutive paragraphs in a single div", async () => {
		const markdown = `テキスト1

テキスト2

テキスト3`;
		const result = await converter.convert(markdown);

		// 連続するp要素がひとつのdivでラップされることを確認
		expect(result).toContain('<div class="paragraph">');
		expect(result).toContain('<p>テキスト1</p>');
		expect(result).toContain('<p>テキスト2</p>');
		expect(result).toContain('<p>テキスト3</p>');
	});

	it("should create separate paragraph divs when interrupted by other elements", async () => {
		const markdown = `テキスト1

テキスト2

## 見出し

テキスト3

テキスト4`;
		const result = await converter.convert(markdown);

		// 見出しで分断された場合、別々のdivになることを確認
		expect(result).toContain('<div class="paragraph">');
		expect(result).toContain('<p>テキスト1</p>');
		expect(result).toContain('<p>テキスト2</p>');
		expect(result).toContain('<div class="h2">');
		expect(result).toContain('<h2>見出し</h2>');
		expect(result).toContain('<p>テキスト3</p>');
		expect(result).toContain('<p>テキスト4</p>');
	});

	it("should handle single paragraph", async () => {
		const markdown = "単一の段落です。";
		const result = await converter.convert(markdown);

		expect(result).toContain('<div class="paragraph">');
		expect(result).toContain('<p>単一の段落です。</p>');
	});

	it("should not affect non-paragraph elements", async () => {
		const markdown = "## 見出しのみ";
		const result = await converter.convert(markdown);

		expect(result).toContain('<div class="h2">');
		expect(result).toContain('<h2>見出しのみ</h2>');
		expect(result).not.toContain('<div class="paragraph">');
	});
});
