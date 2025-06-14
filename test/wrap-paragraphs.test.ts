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
		expect(result).toContain(
			'<div class="paragraph"><p>テキスト1</p><p>テキスト2</p><p>テキスト3</p></div>',
		);
	});

	it("should create separate paragraph divs when interrupted by other elements", async () => {
		const markdown = `テキスト1

テキスト2

## 見出し

テキスト3

テキスト4`;
		const result = await converter.convert(markdown);

		// 見出しで分断された場合、別々のdivになることを確認
		expect(result).toContain(
			'<div class="paragraph"><p>テキスト1</p><p>テキスト2</p></div>',
		);
		expect(result).toContain('<div class="h2"><h2>見出し</h2></div>');
		expect(result).toContain(
			'<div class="paragraph"><p>テキスト3</p><p>テキスト4</p></div>',
		);
	});

	it("should handle single paragraph", async () => {
		const markdown = "単一の段落です。";
		const result = await converter.convert(markdown);

		expect(result).toContain(
			'<div class="paragraph"><p>単一の段落です。</p></div>',
		);
	});

	it("should not affect non-paragraph elements", async () => {
		const markdown = "## 見出しのみ";
		const result = await converter.convert(markdown);

		expect(result).toContain('<div class="h2"><h2>見出しのみ</h2></div>');
		expect(result).not.toContain('<div class="paragraph">');
	});
});
