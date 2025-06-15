import type { Element, ElementContent, Root, RootContent } from "hast";
import { toHtml } from "hast-util-to-html";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import {
	type PlaceholderContext,
	replacePlaceholders,
} from "./placeholder-replacer";
import { loadTemplate } from "./template-loader";

/**
 * Template plugin options
 */
export interface TemplatePluginOptions {
	templateDir?: string;
	profile?: string;
	fallbackToDefault?: boolean;
}

/**
 * 見出し要素をテンプレートでラップするrehypeプラグイン
 */
export function headings(options: TemplatePluginOptions = {}) {
	const {
		templateDir = "./templates",
		profile = "default",
		fallbackToDefault = true,
	} = options;

	return (tree: Root) => {
		function transformNode(node: RootContent): RootContent {
			if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
				// Try to load template for this heading level
				const template = loadTemplate(profile, node.tagName, templateDir);

				if (template) {
					// Use template system
					const context: PlaceholderContext = {
						content: toHtml(node),
						attributes: node.properties,
						id: extractId(node),
						className: extractClassName(node),
						escapeContent: false, // We trust the HTML from markdown processing
					};

					const processedHtml = replacePlaceholders(template, context);

					// Parse the processed HTML back into HAST
					try {
						const parsedNode = parseHtmlToHast(processedHtml);
						return parsedNode;
					} catch (error) {
						console.warn(
							`Failed to parse template result for ${node.tagName}:`,
							error,
						);
					}
				}

				// Fallback to default behavior if no template or parsing failed
				if (fallbackToDefault) {
					const wrapperDiv: Element = {
						type: "element",
						tagName: "div",
						properties: {
							className: [node.tagName], // h1, h2, h3, etc.
						},
						children: [node as ElementContent],
					};
					return wrapperDiv;
				}

				return node;
			}

			// Non-heading elements are returned as-is (no recursive processing to avoid double-wrapping)
			if (node.type === "element") {
				return node;
			}

			return node;
		}

		tree.children = tree.children.map(transformNode);
	};
}

/**
 * 段落要素をテンプレートでラッピングするrehypeプラグイン
 */
export function paragraphs(options: TemplatePluginOptions = {}) {
	const {
		templateDir = "./templates",
		profile = "default",
		fallbackToDefault = true,
	} = options;

	return (tree: Root) => {
		const newChildren: RootContent[] = [];
		let currentParagraphGroup: Element[] = [];
		let currentListGroup: Element[] = [];

		function flushParagraphGroup() {
			if (currentParagraphGroup.length > 0) {
				// Try to load template for paragraph grouping
				const template =
					loadTemplate(profile, "p-group", templateDir) ||
					loadTemplate(profile, "p", templateDir);

				if (template) {
					// Use template system for paragraph groups
					const groupHtml = currentParagraphGroup
						.map((p) => toHtml(p))
						.join("");
					const context: PlaceholderContext = {
						content: groupHtml,
						escapeContent: false,
					};

					const processedHtml = replacePlaceholders(template, context);

					try {
						const parsedNode = parseHtmlToHast(processedHtml);
						newChildren.push(parsedNode);
					} catch (error) {
						console.warn("Failed to parse paragraph template result:", error);
						// Fallback to default behavior
						if (fallbackToDefault) {
							addDefaultParagraphWrapper();
						}
					}
				} else if (fallbackToDefault) {
					addDefaultParagraphWrapper();
				}

				currentParagraphGroup = [];
			}
		}

		function addDefaultParagraphWrapper() {
			const wrapperDiv: Element = {
				type: "element",
				tagName: "div",
				properties: {
					className: ["one-column"],
				},
				children: currentParagraphGroup as ElementContent[],
			};
			newChildren.push(wrapperDiv);
		}

		function flushListGroup() {
			if (currentListGroup.length > 0) {
				// Try to load template for list grouping
				const firstList = currentListGroup[0];
				const listType = firstList.tagName; // 'ul' or 'ol'
				const template =
					loadTemplate(profile, `${listType}-group`, templateDir) ||
					loadTemplate(profile, listType, templateDir);

				if (template) {
					// Use template system for list groups
					const groupHtml = currentListGroup
						.map((list) => toHtml(list))
						.join("");
					const context: PlaceholderContext = {
						content: groupHtml,
						escapeContent: false,
					};

					const processedHtml = replacePlaceholders(template, context);

					try {
						const parsedNode = parseHtmlToHast(processedHtml);
						newChildren.push(parsedNode);
					} catch (error) {
						console.warn("Failed to parse list template result:", error);
						// Fallback to default behavior
						if (fallbackToDefault) {
							addDefaultListWrapper();
						}
					}
				} else if (fallbackToDefault) {
					addDefaultListWrapper();
				}

				currentListGroup = [];
			}
		}

		function addDefaultListWrapper() {
			const wrapperDiv: Element = {
				type: "element",
				tagName: "div",
				properties: {
					className: ["one-column"],
				},
				children: currentListGroup as ElementContent[],
			};
			newChildren.push(wrapperDiv);
		}

		function flushAllGroups() {
			flushParagraphGroup();
			flushListGroup();
		}

		function processNode(node: RootContent): void {
			if (node.type === "element" && node.tagName === "p") {
				// p要素の場合、リストグループをフラッシュしてから段落グループに追加
				flushListGroup();
				currentParagraphGroup.push(node);
			} else if (
				node.type === "element" &&
				(node.tagName === "ul" || node.tagName === "ol")
			) {
				// リスト要素の場合、段落グループをフラッシュしてからリストグループに追加
				flushParagraphGroup();
				currentListGroup.push(node);
			} else if (node.type === "text" && node.value.trim() === "") {
				// 空白のみのテキストノードは無視（要素の連続性を保つため）
				return;
			} else {
				// その他の要素が来たら、全てのグループをフラッシュして新しい要素を追加
				flushAllGroups();

				// Process individual elements with templates
				if (node.type === "element") {
					const processedNode = processElementWithTemplate(
						node,
						profile,
						templateDir,
						fallbackToDefault,
					);
					newChildren.push(processedNode);
				} else {
					newChildren.push(node);
				}
			}
		}

		// ルートレベルの子要素を処理
		for (const child of tree.children) {
			processNode(child);
		}

		// 最後に残った要素グループをフラッシュ
		flushAllGroups();

		tree.children = newChildren;
	};
}

/**
 * Process individual element with template if available
 */
function processElementWithTemplate(
	element: Element,
	profile: string,
	templateDir: string,
	fallbackToDefault: boolean,
): RootContent {
	// Try to load template for this element type
	const template = loadTemplate(profile, element.tagName, templateDir);

	if (template) {
		const context: PlaceholderContext = {
			content: toHtml(element),
			attributes: element.properties,
			id: extractId(element),
			className: extractClassName(element),
			escapeContent: false,
		};

		const processedHtml = replacePlaceholders(template, context);

		try {
			return parseHtmlToHast(processedHtml);
		} catch (error) {
			console.warn(
				`Failed to parse template result for ${element.tagName}:`,
				error,
			);
		}
	}

	// Return original element without recursive processing to avoid double-wrapping

	// Return original element if no template or error
	return element;
}

/**
 * Extract just the inner content of an element (not the element itself)
 */
function extractInnerContent(element: Element): string {
	if (element.children && element.children.length > 0) {
		return element.children
			.map((child) => {
				if (child.type === "text") {
					return child.value;
				} else if (child.type === "element") {
					return toHtml(child);
				}
				return "";
			})
			.join("");
	}
	return "";
}

/**
 * Extract ID from hast element properties
 */
function extractId(element: Element): string | undefined {
	const id = element.properties?.id;
	return typeof id === "string" ? id : undefined;
}

/**
 * Extract class names from hast element properties
 */
function extractClassName(element: Element): string[] | undefined {
	const className = element.properties?.className;
	if (Array.isArray(className)) {
		return className.map(String);
	}
	if (typeof className === "string") {
		return [className];
	}
	return undefined;
}

/**
 * Parse HTML string back to HAST node using rehype-parse
 */
function parseHtmlToHast(html: string): RootContent {
	try {
		const processor = unified().use(rehypeParse, { fragment: true });
		const tree = processor.parse(html) as Root;

		// Return the first child if it exists, otherwise return the root
		if (tree.children && tree.children.length === 1) {
			return tree.children[0];
		}

		// If multiple children, wrap them in a div
		if (tree.children && tree.children.length > 1) {
			return {
				type: "element",
				tagName: "div",
				properties: {},
				children: tree.children,
			} as Element;
		}

		// Fallback for empty content
		return {
			type: "element",
			tagName: "div",
			properties: {},
			children: [],
		} as Element;
	} catch (error) {
		console.warn("Failed to parse HTML:", error);
		// Fallback to a simple text node
		return {
			type: "element",
			tagName: "div",
			properties: {},
			children: [
				{
					type: "text",
					value: html,
				},
			],
		} as Element;
	}
}

// Legacy exports for backward compatibility
export function headingsLegacy() {
	return headings();
}

export function paragraphsLegacy() {
	return paragraphs();
}
