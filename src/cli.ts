import { existsSync } from "node:fs";
import { type ConverterOptions, MarkdownToHtmlConverter } from "./md-to-html";

export interface CliOptions {
	inputFile: string;
	outputFile?: string;
	templateDir?: string;
	profile?: string;
	noTemplates?: boolean;
	help?: boolean;
}

export function showHelp(): string {
	return `
MD Transpiler - Convert Markdown to HTML with custom templates

Usage:
  npm start <inputFile> [outputFile] [options]

Arguments:
  inputFile          Path to the input Markdown file
  outputFile         Path to the output HTML file (optional)

Options:
  --template-dir     Directory containing template files (default: ./templates)
  --profile          Template profile to use (default: default)
  --no-templates     Disable template processing, use default behavior
  --help             Show this help message

Examples:
  npm start document.md
  npm start document.md output.html
  npm start document.md --template-dir ./my-templates --profile blog
  npm start document.md --profile landing-page
  npm start document.md --no-templates

Template Structure:
  templates/
  ├── default/
  │   ├── h1.html
  │   ├── h2.html
  │   └── p.html
  └── blog/
      ├── h1.html
      └── blockquote.html
`;
}

export function parseArguments(args: string[]): CliOptions {
	const options: CliOptions = {
		inputFile: "",
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--help" || arg === "-h") {
			options.help = true;
			continue;
		}

		if (arg === "--template-dir") {
			if (i + 1 >= args.length) {
				throw new Error("--template-dir requires a directory path");
			}
			options.templateDir = args[++i];
			continue;
		}

		if (arg === "--profile") {
			if (i + 1 >= args.length) {
				throw new Error("--profile requires a profile name");
			}
			options.profile = args[++i];
			continue;
		}

		if (arg === "--no-templates") {
			options.noTemplates = true;
			continue;
		}

		if (arg.startsWith("--")) {
			throw new Error(`Unknown option '${arg}'`);
		}

		// Positional arguments
		if (!options.inputFile) {
			options.inputFile = arg;
		} else if (!options.outputFile) {
			options.outputFile = arg;
		} else {
			throw new Error(`Unexpected argument '${arg}'`);
		}
	}

	return options;
}

export function validateOptions(options: CliOptions): void {
	// Check if input file exists
	if (!existsSync(options.inputFile)) {
		throw new Error(`Input file '${options.inputFile}' does not exist`);
	}

	// Check if template directory exists (if specified)
	if (options.templateDir && !existsSync(options.templateDir)) {
		throw new Error(
			`Template directory '${options.templateDir}' does not exist`,
		);
	}

	// Validate profile name (basic check)
	if (options.profile && !/^[a-zA-Z0-9_-]+$/.test(options.profile)) {
		throw new Error(
			`Profile name '${options.profile}' contains invalid characters. Profile names should only contain letters, numbers, hyphens, and underscores`,
		);
	}
}

export function buildConverterOptions(
	cliOptions: CliOptions,
): ConverterOptions {
	const converterOptions: ConverterOptions = {};

	if (cliOptions.templateDir) {
		converterOptions.templateDir = cliOptions.templateDir;
	}

	if (cliOptions.profile) {
		converterOptions.profile = cliOptions.profile;
	}

	if (cliOptions.noTemplates) {
		converterOptions.useTemplates = false;
	}

	return converterOptions;
}

export function formatSuccessMessage(
	inputFile: string,
	outputFile?: string,
	cliOptions?: CliOptions,
): string[] {
	const messages: string[] = [];
	const outputPath = outputFile || inputFile.replace(/\.md$/, ".html");

	messages.push(`✅ Successfully converted '${inputFile}' to '${outputPath}'`);

	if (cliOptions?.noTemplates) {
		messages.push("🔧 Templates disabled - using default behavior");
	} else {
		const templateDir = cliOptions?.templateDir || "./templates";
		const profile = cliOptions?.profile || "default";
		messages.push(`📁 Template directory: ${templateDir}`);
		messages.push(`🎨 Profile: ${profile}`);
	}

	return messages;
}

export async function convertWithOptions(
	inputFile: string,
	outputFile: string | undefined,
	converterOptions: ConverterOptions,
): Promise<void> {
	const converter = new MarkdownToHtmlConverter(converterOptions);
	await converter.convertFile(inputFile, outputFile);
}
