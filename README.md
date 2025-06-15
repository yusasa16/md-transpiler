# MD Transpiler

HTMLテンプレートシステムによるカスタマイズ可能な出力を特徴とする、TypeScript製MarkdownからHTMLへのコンバーターです。ウェブサイトのサブページ作成時のコーディング作業を大幅に削減することを目的としています。

## 機能

- **HTMLテンプレートシステム** - 要素ごとにカスタマイズ可能なHTMLテンプレート
- **複数のテンプレートプロファイル** - ランディングページ、ブログ、ドキュメントなど用途別テンプレート
- **GitHub Flavored Markdown (GFM)** - テーブル、取り消し線、タスクリストなどに対応
- **数式レンダリング** - KaTeXによるLaTeX数式の表示
- **シンタックスハイライト** - 自動言語検出によるコードブロックのハイライト
- **カスタム要素ラッピング** - 見出しと段落の拡張HTML構造
- **高度なCLIインターフェース** - テンプレートオプション付きコマンドライン操作

## インストール

```bash
npm install
```

## 使い方

### コマンドライン

#### 基本的な使用法

```bash
npm start <inputFile> [outputFile] [options]
```

#### オプション

- `--template-dir <dir>` - テンプレートディレクトリを指定（デフォルト: ./templates）
- `--profile <profile>` - テンプレートプロファイルを指定（デフォルト: default）
- `--no-templates` - テンプレートを無効化、デフォルトの動作を使用
- `--help` - ヘルプメッセージを表示

#### 使用例

```bash
# 基本的な変換（デフォルトテンプレート使用）
npm start example.md

# カスタム出力ファイル名で変換
npm start input.md output.html

# ランディングページテンプレートを使用
npm start document.md --profile landing-page

# ブログテンプレートとカスタムテンプレートディレクトリを使用
npm start article.md --template-dir ./my-templates --profile blog

# テンプレートを無効化
npm start document.md --no-templates
```

### プログラム内での使用

```typescript
import { MarkdownToHtmlConverter } from './src/md-to-html';

// デフォルトオプションで使用
const converter = new MarkdownToHtmlConverter();

// テンプレートオプション付きで使用
const templateConverter = new MarkdownToHtmlConverter({
  templateDir: './templates',
  profile: 'landing-page',
  useTemplates: true
});

// 文字列を変換
const html = await converter.convert('# Hello World');

// ファイルを変換
await converter.convertFile('input.md', 'output.html');
```

## HTMLテンプレートシステム

### テンプレート構造

```
templates/
├── default/          # デフォルトテンプレート
│   ├── h1.html       # 見出し1テンプレート
│   ├── h2.html       # 見出し2テンプレート
│   └── p.html        # 段落テンプレート
├── landing-page/     # ランディングページ用
│   ├── h1.html       # ヒーローセクション
│   ├── h2.html       # セクションヘッダー
│   ├── p.html        # スタイル付き段落
│   ├── ul.html       # 機能リスト
│   └── blockquote.html # コールアウトボックス
├── blog/             # ブログ用
│   ├── h1.html       # 記事タイトル
│   ├── h2.html       # 記事の小見出し
│   ├── p.html        # 記事段落
│   ├── code.html     # コードブロック
│   └── blockquote.html # 引用
└── docs/             # ドキュメント用
    ├── h1.html       # ページタイトル
    ├── h2.html       # セクションヘッダー
    ├── blockquote.html # 警告/情報ボックス
    └── ul.html       # 構造化リスト
```

### テンプレートファイルの例

**templates/landing-page/h1.html:**
```html
<section class="hero">
  <div class="container">
    <h1 class="hero-title">{content}</h1>
  </div>
</section>
```

**templates/blog/p.html:**
```html
<div class="article-content">
  <p class="article-text">{content}</p>
</div>
```

### カスタムテンプレートの作成

1. 新しいプロファイルディレクトリを作成
2. 必要な要素のHTMLファイルを作成
3. `{content}` プレースホルダーでコンテンツを挿入
4. `--profile` オプションで使用

詳細は `templates/README.md` を参照してください。

## サポートしているMarkdown機能

- 標準Markdown記法
- GitHub Flavored Markdown拡張機能
- 数式表記（インライン: `$...$`、ブロック: `$$...$$`）
- シンタックスハイライト付きコードブロック
- テーブル、取り消し線、タスクリスト
- 生HTML対応

## 開発

### スクリプト

- `npm start <file> [options]` - Markdownファイルを変換（テンプレートオプション付き）
- `npm test` - テストスイートを実行（90テストが含まれます）
- `npm run lint` - コード品質をチェック
- `npm run lint:fix` - リンターの問題を修正

### テスト

プロジェクトには以下を含む包括的なテストスイート（90テスト）が含まれています：

- HTMLテンプレートシステムのテスト
- プレースホルダー置換のテスト
- CLIオプションのテスト
- 要素ラッピング機能のテスト
- テンプレートローダーのテスト

```bash
npm test
```

## プロジェクト構造

```
md-transpiler/
├── src/
│   ├── md-to-html.ts           # メインコンバーター
│   ├── template-loader.ts      # テンプレートローディング
│   ├── placeholder-replacer.ts # プレースホルダー置換
│   ├── rehype-wrap-element.ts  # 要素ラッピングプラグイン
│   ├── cli.ts                  # CLI機能
│   └── index.ts                # CLI エントリーポイント
├── templates/                  # HTMLテンプレート
│   ├── default/                # デフォルトテンプレート
│   ├── landing-page/           # ランディングページテンプレート
│   ├── blog/                   # ブログテンプレート
│   ├── docs/                   # ドキュメントテンプレート
│   └── README.md               # テンプレート使用ガイド
├── test/                       # テストファイル
└── ROADMAP.md                  # 開発ロードマップ
```

## アーキテクチャ

このプロジェクトは**unified**エコシステムを基盤とした拡張可能なアーキテクチャを採用しています：

1. **Markdownパース** - remarkによる構文解析
2. **テンプレート処理** - カスタムrehypeプラグインによる要素変換
3. **HTML生成** - rehypeによる最終出力生成

## 依存関係

### 実行時依存関係
- **unified** - テキスト処理フレームワーク
- **remark** - Markdownプロセッサー（remark-parse, remark-gfm, remark-math, remark-rehype）
- **rehype** - HTMLプロセッサー（rehype-parse, rehype-raw, rehype-highlight, rehype-katex, rehype-stringify）
- **KaTeX** - 数式レンダリング
- **highlight.js** - シンタックスハイライト

### 開発依存関係
- **TypeScript** - 型安全な開発
- **Vitest** - 高速テストランナー
- **Biome** - 高速リンターとフォーマッター

## 今後の予定

詳細な開発計画については `ROADMAP.md` を参照してください。

主な予定機能：
- Phase 2: 高度なラッピングロジック（条件付きラッパー、ネスト対応など）
- Phase 3: ウェブサイト特化機能（レイアウトテンプレート、SEO最適化など）
- Phase 4: 開発者体験向上（ライブプレビュー、VSCode拡張など）

## ライセンス

ISC