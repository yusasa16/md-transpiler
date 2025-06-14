import type { Element, ElementContent, Root, RootContent } from "hast";
import { visit } from "unist-util-visit";

/**
 * 見出し要素をdivでラップするrehypeプラグイン
 */
export function headings() {
	return (tree: Root) => {
		function transformNode(node: RootContent): RootContent {
			if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
				// 見出し要素をdivでラップ
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

			// 子要素がある場合は再帰的に処理
			if (node.type === "element" && node.children) {
				return {
					...node,
					children: node.children.map((child) =>
						transformNode(child as RootContent),
					) as ElementContent[],
				};
			}

			return node;
		}

		tree.children = tree.children.map(transformNode);
	};
}

export function paragraphs() {
	return (tree: Root) => {
		const newChildren: RootContent[] = [];
		let currentParagraphGroup: Element[] = [];

		function flushParagraphGroup() {
			if (currentParagraphGroup.length > 0) {
				const wrapperDiv: Element = {
					type: "element",
					tagName: "div",
					properties: {
						className: ["paragraph"],
					},
					children: currentParagraphGroup as ElementContent[],
				};
				newChildren.push(wrapperDiv);
				currentParagraphGroup = [];
			}
		}

		function processNode(node: RootContent): void {
			if (node.type === "element" && node.tagName === "p") {
				// p要素は現在のグループに追加
				currentParagraphGroup.push(node);
			} else if (node.type === "text" && node.value.trim() === "") {
				// 空白のみのテキストノードは無視（段落の連続性を保つため）
				return;
			} else {
				// p要素以外が来たら、現在のグループをフラッシュして新しい要素を追加
				flushParagraphGroup();

				// 子要素がある場合は再帰的に処理
				if (node.type === "element" && node.children) {
					const processedNode = {
						...node,
						children: processChildren(node.children),
					};
					newChildren.push(processedNode);
				} else {
					newChildren.push(node);
				}
			}
		}

		function processChildren(children: ElementContent[]): ElementContent[] {
			const result: ElementContent[] = [];
			let paragraphGroup: Element[] = [];

			function flushChildParagraphGroup() {
				if (paragraphGroup.length > 0) {
					const wrapperDiv: Element = {
						type: "element",
						tagName: "div",
						properties: {
							className: ["paragraph"],
						},
						children: paragraphGroup as ElementContent[],
					};
					result.push(wrapperDiv);
					paragraphGroup = [];
				}
			}

			for (const child of children) {
				if (child.type === "element" && child.tagName === "p") {
					paragraphGroup.push(child);
				} else if (child.type === "text" && child.value.trim() === "") {
					// 空白のみのテキストノードは無視
				} else {
					flushChildParagraphGroup();

					if (child.type === "element" && child.children) {
						const processedChild = {
							...child,
							children: processChildren(child.children),
						};
						result.push(processedChild);
					} else {
						result.push(child);
					}
				}
			}

			flushChildParagraphGroup();
			return result;
		}

		// ルートレベルの子要素を処理
		for (const child of tree.children) {
			processNode(child);
		}

		// 最後に残ったp要素グループをフラッシュ
		flushParagraphGroup();

		tree.children = newChildren;
	};
}
