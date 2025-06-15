import {
	buildConverterOptions,
	convertWithOptions,
	formatSuccessMessage,
	parseArguments,
	showHelp,
	validateOptions,
} from "./cli";

async function main(): Promise<void> {
	try {
		const args = process.argv.slice(2);
		const options = parseArguments(args);

		// Show help if requested
		if (options.help) {
			console.log(showHelp());
			return;
		}

		// Check for required arguments
		if (!options.inputFile) {
			console.error("Error: Input file is required");
			console.error("Use --help to see usage instructions");
			process.exit(1);
		}

		// Validate options
		validateOptions(options);

		// Build converter options and convert
		const converterOptions = buildConverterOptions(options);
		await convertWithOptions(
			options.inputFile,
			options.outputFile,
			converterOptions,
		);

		// Show success messages
		const messages = formatSuccessMessage(
			options.inputFile,
			options.outputFile,
			options,
		);
		for (const message of messages) {
			console.log(message);
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error("❌ Unexpected error:", error);
		}
		process.exit(1);
	}
}

// Run main function
main().catch((error) => {
	console.error("❌ Unexpected error:", error);
	process.exit(1);
});
