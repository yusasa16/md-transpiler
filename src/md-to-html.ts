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
import { extractFrontmatter } from "./placeholder-replacer";
import {
	type TemplatePluginOptions,
	headings,
	paragraphs,
} from "./rehype-wrap-element";

/**
 * Template configuration for MarkdownToHtmlConverter
 */
export interface ConverterOptions {
	templateDir?: string;
	profile?: string;
	useTemplates?: boolean;
}

/**
 * MarkdownからHTMLに変換するクラス
 */
export class MarkdownToHtmlConverter {
	private processor;
	private options: ConverterOptions;

	constructor(options: ConverterOptions = {}) {
		this.options = {
			templateDir: "./templates",
			profile: "default",
			useTemplates: true,
			...options,
		};

		const templateOptions: TemplatePluginOptions = {
			templateDir: this.options.templateDir,
			profile: this.options.profile,
			fallbackToDefault: true,
		};

		this.processor = unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkMath)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeRaw)
			.use(rehypeKatex)
			.use(rehypeHighlight)
			.use(headings, this.options.useTemplates ? templateOptions : {})
			.use(paragraphs, this.options.useTemplates ? templateOptions : {})
			.use(rehypeStringify);
	}

	/**
	 * Markdown文字列をHTMLに変換
	 */
	async convert(markdown: string): Promise<string> {
		// Extract frontmatter if present
		const { content, frontmatter } = extractFrontmatter(markdown);

		// Store frontmatter for template use (if needed in future)
		// For now, just process the content
		const result = await this.processor.process(content);
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
