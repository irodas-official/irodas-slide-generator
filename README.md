# irodas Slide Generator

Claude Code × HTMLによるスライド生成システム。  
自然言語の指示だけで、統一感のあるプレゼンテーションスライドを生成する。

## 特徴

- **1スライド1ファイル** — コンテキスト消費を最小限に抑える分割管理
- **Tailwind CSS** — 各ファイルが自己完結し、外部CSSに依存しない
- **デザインテーマ** — 色・フォント・余白をJSON定義で統一
- **バリデーション** — Puppeteerによるはみ出し・重なり・余白不足の自動検出
- **プレゼンモード** — フルスクリーン表示、発表者ビュー、スピーカーノート、経過時間
- **PDF出力** — 全スライドを1つのPDFに結合
- **画像生成** — Gemini 3.1 Flash Image Preview でスライド用画像を生成

## セットアップ

```bash
pnpm install
cp .env.example .env
# .env を編集して GEMINI_API_KEY を設定（画像生成を使う場合）
```

APIキーは [Google AI Studio](https://aistudio.google.com/apikey) で取得できる。

## 使い方

### Claude Code から（推奨）

このプロジェクトで Claude Code を起動すると `.claude/skills/` のスキルが自動認識される。  
以下のように話しかけるだけ:

- 「このデータでスライドを作って」→ **スライド作成**
- 「このmdをスライドにして」→ **マークダウンからスライド作成**
- 「3枚目のグラフを大きくして」→ **スライド修正**
- 「はみ出しチェックして」→ **バリデーション**
- 「PDFにして」→ **PDF出力**
- 「カバーに画像を入れて」→ **画像生成**

### CLIから直接

```bash
# 新規デッキ作成
pnpm generate my-deck

# プレビュー（ブラウザが自動で開く）
pnpm dev my-deck

# バリデーション
pnpm validate slides/my-deck

# 画像生成
pnpm image slides/my-deck "ビジネス成長を表すイラスト、フラットデザイン"

# PDF出力
pnpm export-pdf slides/my-deck
```

## スライドの確認

```bash
pnpm dev sample
```

ローカルサーバーが起動し、ブラウザでスライド一覧が表示される。  
`Ctrl+C` で終了。

### プレゼンテーション操作

- **「プレゼンテーション」ボタン** — フルスクリーンでスライド表示
- **「発表者ビュー」ボタン** — 現在のスライド・次のスライド・スピーカーノート・経過時間を表示

| 操作 | キー |
|---|---|
| 次のスライド | `→` / `Space` / `Enter` / 画面右クリック |
| 前のスライド | `←` / `Backspace` / 画面左クリック |
| 終了 | `Esc` / ✕ボタン |

### スピーカーノート

各スライドHTMLのルート要素に `data-speaker-notes` 属性で記述する。  
発表者ビューの「スピーカーノート」欄に表示される。

```html
<div class="w-[1280px] h-[720px] ..."
     data-speaker-notes="ここに発表時のメモを書く。箇条書きでもOK。">
  <!-- スライドの中身 -->
</div>
```

viewer.htmlの `slides` 配列にも `notes` として記述する:

```javascript
const slides = [
  { file: 'slide_01.html', notes: 'ここにノートを書く' },
  { file: 'slide_02.html', notes: '' },
];
```

## ディレクトリ構成

```
├── .claude/skills/       Claude Code スキル
│   ├── create-slide/     スライド新規作成
│   ├── md-to-slide/      マークダウンからスライド作成
│   ├── fix-slide/        スライド修正
│   ├── validate-slide/   バリデーション
│   ├── export-pdf/       PDF出力
│   └── generate-image/   画像生成
├── templates/            レイアウトテンプレート（7種）
├── themes/               デザインテーマ定義
├── scripts/              ユーティリティスクリプト
├── slides/               スライドデッキ
└── output/               PDF出力先
```

## テンプレート一覧

| テンプレート | 用途 |
|---|---|
| cover | カバースライド |
| section | 中扉（セクション区切り） |
| content-text | テキスト＋箇条書き |
| chart-bar | 棒グラフ |
| table | テーブル |
| cards | KPIカード / 数値ハイライト |
| key-message | キーメッセージ |

## テーマのカスタマイズ

`themes/irodas.json` を編集するか、新しいテーマJSONを作成する。  
Claude Code に「ダーク系のテーマを作って」と頼めば自動生成される。
