# MD Transpiler

シンタックスハイライト、数式レンダリング、GitHub Flavored Markdown対応などの拡張機能を持つTypeScript製MarkdownからHTMLへのコンバーターです。

## 機能

- **GitHub Flavored Markdown (GFM)** - テーブル、取り消し線、タスクリストなどに対応
- **数式レンダリング** - KaTeXによるLaTeX数式の表示
- **シンタックスハイライト** - 自動言語検出によるコードブロックのハイライト
- **カスタム要素ラッピング** - 見出しと段落の拡張HTML構造
- **CLIインターフェース** - シンプルなコマンドライン操作

## インストール

```bash
npm install
```

## 使い方

### コマンドライン

MarkdownファイルをHTMLに変換：

```bash
npm start <inputFile> [outputFile]
```

**例：**

```bash
# example.mdをexample.htmlに変換
npm start example.md

# カスタム出力ファイル名で変換
npm start input.md output.html
```

### プログラム内での使用

```typescript
import { MarkdownToHtmlConverter } from './src/md-to-html';

const converter = new MarkdownToHtmlConverter();

// 文字列を変換
const html = await converter.convert('# Hello World');

// ファイルを変換
await converter.convertFile('input.md', 'output.html');
```

## サポートしているMarkdown機能

- 標準Markdown記法
- GitHub Flavored Markdown拡張機能
- 数式表記（インライン: `$...$`、ブロック: `$$...$$`）
- シンタックスハイライト付きコードブロック
- テーブル、取り消し線、タスクリスト
- 生HTML対応

## 開発

### スクリプト

- `npm start <file>` - Markdownファイルを変換
- `npm test` - テストスイートを実行
- `npm run lint` - コード品質をチェック
- `npm run lint:fix` - リンターの問題を修正

### テスト

プロジェクトにはフィクスチャファイルを使った包括的なテストが含まれています：

```bash
npm test
```

## 依存関係

- **unified** - テキスト処理フレームワーク
- **remark** - Markdownプロセッサー
- **rehype** - HTMLプロセッサー
- **KaTeX** - 数式レンダリング
- **highlight.js** - シンタックスハイライト

## ライセンス

ISC