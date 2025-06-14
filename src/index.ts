import { MarkdownToHtmlConverter } from "./md-to-html";

async function main(inputFile: string, outputFile?: string) {
	const converter = new MarkdownToHtmlConverter();

	await converter.convertFile(inputFile, outputFile);
}

// コマンドライン引数から取得
const inputFile = process.argv[2];
if (!inputFile) {
	console.error("使用方法: npm start <inputFile> [outputFile]");
	process.exit(1);
}

const outputFile = process.argv[3];

main(inputFile, outputFile);
