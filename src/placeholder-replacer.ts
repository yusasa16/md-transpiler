import type { Properties } from "hast";

/**
 * Context data for placeholder replacement
 */
export interface PlaceholderContext {
	content: string;
	attributes?: Properties;
	frontmatter?: Record<string, unknown>;
	id?: string;
	className?: string[];
}

/**
 * Replace placeholders in a template with actual values
 * @param template - HTML template with placeholders
 * @param context - Context data for replacement
 * @returns Processed HTML with placeholders replaced
 */
export function replacePlaceholders(
	template: string,
	context: PlaceholderContext,
): string {
	let result = template;

	// Replace {content} with the actual element content
	result = result.replace(/{content}/g, context.content);

	// Replace {attributes} with stringified attributes
	if (context.attributes) {
		const attributeString = stringifyAttributes(context.attributes);
		result = result.replace(/{attributes}/g, attributeString);
	} else {
		result = result.replace(/{attributes}/g, "");
	}

	// Replace {id} with element ID
	if (context.id) {
		result = result.replace(/{id}/g, escapeHtml(context.id));
	} else {
		result = result.replace(/{id}/g, "");
	}

	// Replace {class} with element classes
	if (context.className && context.className.length > 0) {
		const classString = context.className.join(" ");
		result = result.replace(/{class}/g, escapeHtml(classString));
	} else {
		result = result.replace(/{class}/g, "");
	}

	// Replace frontmatter placeholders like {frontmatter.title}
	if (context.frontmatter) {
		result = replaceFrontmatterPlaceholders(result, context.frontmatter);
	}

	return result;
}

/**
 * Convert hast properties to HTML attribute string
 * @param properties - hast properties object
 * @returns HTML attribute string
 */
export function stringifyAttributes(properties: Properties): string {
	const attributes: string[] = [];

	for (const [key, value] of Object.entries(properties)) {
		if (value === null || value === undefined) {
			continue;
		}

		if (typeof value === "boolean") {
			if (value) {
				attributes.push(escapeHtml(key));
			}
		} else if (Array.isArray(value)) {
			const stringValue = value.join(" ");
			attributes.push(`${escapeHtml(key)}="${escapeHtml(stringValue)}"`);
		} else {
			attributes.push(`${escapeHtml(key)}="${escapeHtml(String(value))}"`);
		}
	}

	return attributes.join(" ");
}

/**
 * Replace frontmatter placeholders like {frontmatter.title}
 * @param template - Template string
 * @param frontmatter - Frontmatter data
 * @returns Template with frontmatter placeholders replaced
 */
export function replaceFrontmatterPlaceholders(
	template: string,
	frontmatter: Record<string, unknown>,
): string {
	return template.replace(/{frontmatter\.([^}]+)}/g, (match, path) => {
		const value = getNestedValue(frontmatter, path);
		return value !== undefined ? escapeHtml(String(value)) : "";
	});
}

/**
 * Get nested value from object using dot notation
 * @param obj - Object to search in
 * @param path - Dot-separated path (e.g., "author.name")
 * @returns Value at path or undefined
 */
export function getNestedValue(
	obj: Record<string, unknown>,
	path: string,
): unknown {
	return path.split(".").reduce((current: unknown, key: string) => {
		if (current && typeof current === "object" && key in current) {
			return (current as Record<string, unknown>)[key];
		}
		return undefined;
	}, obj);
}

/**
 * Escape HTML characters to prevent XSS
 * @param text - Text to escape
 * @returns HTML-escaped text
 */
export function escapeHtml(text: string): string {
	const htmlEscapes: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#x27;",
		"/": "&#x2F;",
	};

	return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
}

/**
 * Extract frontmatter from markdown content
 * Simple implementation for YAML frontmatter
 * @param markdown - Markdown content with potential frontmatter
 * @returns Object with content and frontmatter
 */
export function extractFrontmatter(markdown: string): {
	content: string;
	frontmatter: Record<string, unknown>;
} {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = markdown.match(frontmatterRegex);

	if (!match) {
		return {
			content: markdown,
			frontmatter: {},
		};
	}

	const frontmatterYaml = match[1];
	const content = markdown.slice(match[0].length);

	try {
		// Simple YAML parsing for basic key: value pairs
		const frontmatter = parseSimpleYaml(frontmatterYaml);
		return { content, frontmatter };
	} catch (error) {
		console.warn("Failed to parse frontmatter:", error);
		return {
			content: markdown,
			frontmatter: {},
		};
	}
}

/**
 * Simple YAML parser for basic key: value pairs
 * @param yaml - YAML string
 * @returns Parsed object
 */
export function parseSimpleYaml(yaml: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const lines = yaml.split("\n");

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		const colonIndex = trimmed.indexOf(":");
		if (colonIndex === -1) {
			continue;
		}

		const key = trimmed.slice(0, colonIndex).trim();
		const value = trimmed.slice(colonIndex + 1).trim();

		// Remove quotes if present
		const cleanValue = value.replace(/^["']|["']$/g, "");

		// Try to parse as number or boolean
		if (cleanValue === "true") {
			result[key] = true;
		} else if (cleanValue === "false") {
			result[key] = false;
		} else if (!Number.isNaN(Number(cleanValue)) && cleanValue !== "") {
			result[key] = Number(cleanValue);
		} else {
			result[key] = cleanValue;
		}
	}

	return result;
}
