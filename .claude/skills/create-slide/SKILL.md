---
name: スライド作成
description: This skill should be used when the user asks to "スライドを作って", "プレゼンを作成", "スライド作成", "このデータをスライドにして", "プレゼン資料を作って", or mentions creating a new slide deck from data or notes.
version: 1.0.0
---

# スライド作成スキル

元データからHTMLスライドデッキを生成する。

## ワークフロー

1. 元データを読み込み、スライド構成を提案する（カバー、各コンテンツ、まとめ等）
2. ユーザーの承認を得てから生成を開始する
3. `slides/` 配下にデッキディレクトリを作成
4. 各スライドを個別HTMLファイルとして生成（slide_01.html, slide_02.html, ...）
5. viewer.htmlを生成（slides配列を設定）
6. `pnpm validate` で検証し、問題があれば自動修正

## スライド生成ルール

### ファイル構造
- **1スライド = 1HTMLファイル**。コンテキスト消費を最小限にするため
- スライドサイズ: **1280×720px** 固定
- 修正時は対象ファイルだけ読み書きする

### 各HTMLの必須ヘッダー

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=1280, height=720">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1280px; height: 720px; overflow: hidden; }
</style>
<script>
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['"Noto Sans JP"', 'sans-serif'] },
      colors: {
        primary: '#1B73E8', 'primary-dark': '#1557B0',
        secondary: '#34A853', accent: '#FF6D2E',
      }
    }
  }
}
</script>
```

### デザイン
- `themes/irodas.json` の色・フォントに従う
- `templates/` のレイアウトパターンを参考にする
- パターンにないレイアウトもテーマに沿って自由に生成してよい
- 棒グラフのバー高さは必ず **px指定**（%はflex内で効かない。最大約340px）
- スピーカーノートは `data-speaker-notes` 属性で記述
- カバー・中扉以外にはページ番号を入れる

### viewer.html
生成後、`templates/viewer.html` をベースに、slides配列を更新する:
```javascript
const slides = [
  { file: 'slide_01.html', notes: 'ノート内容' },
  ...
];
```

### レイアウトパターン一覧
- **cover** — カバースライド
- **section** — 中扉（セクション区切り）
- **content-text** — テキスト＋箇条書き
- **chart-bar** — 棒グラフ（CSS描画）
- **table** — テーブルレイアウト
- **cards** — カード型KPI / 数値ハイライト
- **key-message** — キーメッセージ（大きなテキスト中央配置）

### 画像生成との連携
`GEMINI_API_KEY` が設定されている場合、`pnpm image` でスライド用画像を生成できる。  
カバー背景やコンセプト図など、ビジュアルが効果的な場面では generate-image スキルと組み合わせて使う。
