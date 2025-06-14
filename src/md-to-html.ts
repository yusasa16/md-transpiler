import { readFileSync, writeFileSync } from "node:fs";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { headings, paragraphs } from "./rehype-wrap-element";

/**
 * MarkdownからHTMLに変換するクラス
 */
export class MarkdownToHtmlConverter {
	private processor;

	constructor() {
		this.processor = unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkMath)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeRaw)
			.use(rehypeKatex)
			.use(rehypeHighlight)
			.use(headings)
			.use(paragraphs)
			.use(rehypeStringify);
	}

	/**
	 * Markdown文字列をHTMLに変換
	 */
	async convert(markdown: string): Promise<string> {
		const result = await this.processor.process(markdown);
		return String(result);
	}

	/**
	 * MarkdownファイルをHTMLファイルに変換
	 */
	async convertFile(inputPath: string, outputPath?: string): Promise<void> {
		const markdown = readFileSync(inputPath, "utf-8");
		const html = await this.convert(markdown);

		const finalOutputPath = outputPath || inputPath.replace(/\.md$/, ".html");
		writeFileSync(finalOutputPath, html, "utf-8");
	}
}
