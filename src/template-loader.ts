import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Template cache - using module-level cache for simplicity
const templateCache = new Map<string, string>();

/**
 * Load a template for a specific element type and profile
 * @param profile - Template profile (e.g., 'landing-page', 'blog')
 * @param elementType - HTML element type (e.g., 'h1', 'p', 'ul')
 * @param templateDir - Template directory path (defaults to './templates')
 * @returns Template content or null if not found
 */
export function loadTemplate(
	profile: string,
	elementType: string,
	templateDir = "./templates",
): string | null {
	const cacheKey = `${templateDir}:${profile}:${elementType}`;

	// Return cached template if available
	if (templateCache.has(cacheKey)) {
		return templateCache.get(cacheKey) || null;
	}

	const templatePath = join(templateDir, profile, `${elementType}.html`);

	try {
		if (!existsSync(templatePath)) {
			templateCache.set(cacheKey, "");
			return null;
		}

		const template = readFileSync(templatePath, "utf-8");

		if (!validateTemplateSyntax(template)) {
			console.warn(`Invalid template syntax in ${templatePath}`);
			templateCache.set(cacheKey, "");
			return null;
		}

		templateCache.set(cacheKey, template);
		return template;
	} catch (error) {
		console.error(`Error loading template ${templatePath}:`, error);
		templateCache.set(cacheKey, "");
		return null;
	}
}

/**
 * Load all templates for a specific profile
 * @param profile - Template profile
 * @param templateDir - Template directory path (defaults to './templates')
 * @returns Map of element types to template content
 */
export function loadAllTemplates(
	profile: string,
	templateDir = "./templates",
): Map<string, string> {
	const templates = new Map<string, string>();
	const profileDir = join(templateDir, profile);

	if (!existsSync(profileDir)) {
		return templates;
	}

	// Common HTML elements that might have templates
	const elementTypes = [
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"p",
		"ul",
		"ol",
		"li",
		"blockquote",
		"code",
		"pre",
		"table",
		"thead",
		"tbody",
		"tr",
		"td",
		"th",
		"img",
		"a",
		"strong",
		"em",
	];

	for (const elementType of elementTypes) {
		const template = loadTemplate(profile, elementType, templateDir);
		if (template) {
			templates.set(elementType, template);
		}
	}

	return templates;
}

/**
 * Validate template syntax for basic issues
 * @param template - Template content to validate
 * @returns True if template appears valid
 */
export function validateTemplateSyntax(template: string): boolean {
	// Basic validation - check for balanced {content} placeholder
	if (!template.includes("{content}")) {
		return false;
	}

	// Check for basic HTML structure (should contain at least one HTML tag)
	if (!/(<[^>]+>)/g.test(template)) {
		return false;
	}

	return true;
}

/**
 * Clear the template cache
 */
export function clearTemplateCache(): void {
	templateCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getTemplateCacheStats(): { size: number; keys: string[] } {
	return {
		size: templateCache.size,
		keys: Array.from(templateCache.keys()),
	};
}
