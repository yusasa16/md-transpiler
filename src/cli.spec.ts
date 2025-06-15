import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	type CliOptions,
	buildConverterOptions,
	formatSuccessMessage,
	parseArguments,
	showHelp,
	validateOptions,
} from "./cli";

// Mock the MarkdownToHtmlConverter
vi.mock("./md-to-html", () => ({
	MarkdownToHtmlConverter: vi.fn().mockImplementation(() => ({
		convertFile: vi.fn().mockResolvedValue(undefined),
	})),
}));

describe("CLI functions", () => {
	const testDir = "./test-cli";
	const testMarkdownFile = join(testDir, "test.md");
	const testTemplateDir = join(testDir, "templates");

	beforeEach(() => {
		// Create test directory and files
		mkdirSync(testDir, { recursive: true });
		mkdirSync(join(testTemplateDir, "default"), { recursive: true });
		writeFileSync(testMarkdownFile, "# Test Markdown");
		writeFileSync(
			join(testTemplateDir, "default", "h1.html"),
			"<h1>{content}</h1>",
		);
	});

	afterEach(() => {
		// Clean up test files
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true, force: true });
		}
	});

	describe("showHelp", () => {
		it("should return help text", () => {
			const help = showHelp();

			expect(help).toContain("MD Transpiler");
			expect(help).toContain("Usage:");
			expect(help).toContain("--template-dir");
			expect(help).toContain("--profile");
			expect(help).toContain("--no-templates");
			expect(help).toContain("Examples:");
		});
	});

	describe("parseArguments", () => {
		it("should parse basic file argument", () => {
			const args = ["test.md"];
			const result = parseArguments(args);

			expect(result.inputFile).toBe("test.md");
			expect(result.outputFile).toBeUndefined();
			expect(result.help).toBeUndefined();
		});

		it("should parse input and output files", () => {
			const args = ["input.md", "output.html"];
			const result = parseArguments(args);

			expect(result.inputFile).toBe("input.md");
			expect(result.outputFile).toBe("output.html");
		});

		it("should parse --help flag", () => {
			const args = ["--help"];
			const result = parseArguments(args);

			expect(result.help).toBe(true);
		});

		it("should parse -h flag", () => {
			const args = ["-h"];
			const result = parseArguments(args);

			expect(result.help).toBe(true);
		});

		it("should parse --template-dir option", () => {
			const args = ["test.md", "--template-dir", "./my-templates"];
			const result = parseArguments(args);

			expect(result.inputFile).toBe("test.md");
			expect(result.templateDir).toBe("./my-templates");
		});

		it("should parse --profile option", () => {
			const args = ["test.md", "--profile", "blog"];
			const result = parseArguments(args);

			expect(result.inputFile).toBe("test.md");
			expect(result.profile).toBe("blog");
		});

		it("should parse --no-templates flag", () => {
			const args = ["test.md", "--no-templates"];
			const result = parseArguments(args);

			expect(result.inputFile).toBe("test.md");
			expect(result.noTemplates).toBe(true);
		});

		it("should parse multiple options", () => {
			const args = [
				"test.md",
				"output.html",
				"--template-dir",
				"./templates",
				"--profile",
				"landing-page",
			];
			const result = parseArguments(args);

			expect(result.inputFile).toBe("test.md");
			expect(result.outputFile).toBe("output.html");
			expect(result.templateDir).toBe("./templates");
			expect(result.profile).toBe("landing-page");
		});

		it("should throw error for unknown option", () => {
			const args = ["test.md", "--unknown"];

			expect(() => parseArguments(args)).toThrow("Unknown option '--unknown'");
		});

		it("should throw error for missing --template-dir value", () => {
			const args = ["test.md", "--template-dir"];

			expect(() => parseArguments(args)).toThrow(
				"--template-dir requires a directory path",
			);
		});

		it("should throw error for missing --profile value", () => {
			const args = ["test.md", "--profile"];

			expect(() => parseArguments(args)).toThrow(
				"--profile requires a profile name",
			);
		});

		it("should throw error for too many positional arguments", () => {
			const args = ["test.md", "output.html", "extra.html"];

			expect(() => parseArguments(args)).toThrow(
				"Unexpected argument 'extra.html'",
			);
		});
	});

	describe("validateOptions", () => {
		it("should validate existing input file", () => {
			const options: CliOptions = {
				inputFile: testMarkdownFile,
			};

			expect(() => validateOptions(options)).not.toThrow();
		});

		it("should throw error for non-existent input file", () => {
			const options: CliOptions = {
				inputFile: "nonexistent.md",
			};

			expect(() => validateOptions(options)).toThrow(
				"Input file 'nonexistent.md' does not exist",
			);
		});

		it("should validate existing template directory", () => {
			const options: CliOptions = {
				inputFile: testMarkdownFile,
				templateDir: testTemplateDir,
			};

			expect(() => validateOptions(options)).not.toThrow();
		});

		it("should throw error for non-existent template directory", () => {
			const options: CliOptions = {
				inputFile: testMarkdownFile,
				templateDir: "./nonexistent-templates",
			};

			expect(() => validateOptions(options)).toThrow(
				"Template directory './nonexistent-templates' does not exist",
			);
		});

		it("should validate correct profile names", () => {
			const validProfiles = ["blog", "landing-page", "docs_v2", "profile-123"];

			for (const profile of validProfiles) {
				const options: CliOptions = {
					inputFile: testMarkdownFile,
					profile,
				};
				expect(() => validateOptions(options)).not.toThrow();
			}
		});

		it("should throw error for invalid profile names", () => {
			const invalidProfiles = [
				"profile@name",
				"profile.name",
				"profile name",
				"profile/name",
			];

			for (const profile of invalidProfiles) {
				const options: CliOptions = {
					inputFile: testMarkdownFile,
					profile,
				};
				expect(() => validateOptions(options)).toThrow(
					"contains invalid characters",
				);
			}
		});
	});

	describe("buildConverterOptions", () => {
		it("should build empty options for minimal CLI options", () => {
			const cliOptions: CliOptions = {
				inputFile: "test.md",
			};

			const result = buildConverterOptions(cliOptions);

			expect(result).toEqual({});
		});

		it("should build options with template directory", () => {
			const cliOptions: CliOptions = {
				inputFile: "test.md",
				templateDir: "./my-templates",
			};

			const result = buildConverterOptions(cliOptions);

			expect(result.templateDir).toBe("./my-templates");
		});

		it("should build options with profile", () => {
			const cliOptions: CliOptions = {
				inputFile: "test.md",
				profile: "blog",
			};

			const result = buildConverterOptions(cliOptions);

			expect(result.profile).toBe("blog");
		});

		it("should build options with templates disabled", () => {
			const cliOptions: CliOptions = {
				inputFile: "test.md",
				noTemplates: true,
			};

			const result = buildConverterOptions(cliOptions);

			expect(result.useTemplates).toBe(false);
		});

		it("should build complete options", () => {
			const cliOptions: CliOptions = {
				inputFile: "test.md",
				templateDir: "./my-templates",
				profile: "landing-page",
			};

			const result = buildConverterOptions(cliOptions);

			expect(result.templateDir).toBe("./my-templates");
			expect(result.profile).toBe("landing-page");
		});
	});

	describe("formatSuccessMessage", () => {
		it("should format basic success message", () => {
			const messages = formatSuccessMessage("test.md");

			expect(messages).toContain(
				"✅ Successfully converted 'test.md' to 'test.html'",
			);
			expect(messages).toContain("📁 Template directory: ./templates");
			expect(messages).toContain("🎨 Profile: default");
		});

		it("should format message with custom output file", () => {
			const messages = formatSuccessMessage("test.md", "custom.html");

			expect(messages).toContain(
				"✅ Successfully converted 'test.md' to 'custom.html'",
			);
		});

		it("should format message with templates disabled", () => {
			const cliOptions: CliOptions = {
				inputFile: "test.md",
				noTemplates: true,
			};

			const messages = formatSuccessMessage("test.md", undefined, cliOptions);

			expect(messages).toContain(
				"🔧 Templates disabled - using default behavior",
			);
			expect(messages).not.toContain("📁 Template directory");
		});

		it("should format message with custom template options", () => {
			const cliOptions: CliOptions = {
				inputFile: "test.md",
				templateDir: "./my-templates",
				profile: "blog",
			};

			const messages = formatSuccessMessage("test.md", undefined, cliOptions);

			expect(messages).toContain("📁 Template directory: ./my-templates");
			expect(messages).toContain("🎨 Profile: blog");
		});
	});
});
