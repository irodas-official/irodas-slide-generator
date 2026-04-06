---
name: スライド用画像生成
description: This skill should be used when the user asks to "画像を生成して", "イラストを作って", "スライドに画像を入れて", "図を生成", "アイキャッチを作って", or mentions generating, creating, or adding images or illustrations to slides. Also automatically used by other slide creation skills when visual elements would enhance the presentation.
version: 1.0.0
---

# スライド用画像生成スキル

Gemini 3.1 Flash Image Preview の画像生成機能を使ってスライド用の画像を生成し、スライドに埋め込む。

## 前提条件

環境変数 `GEMINI_API_KEY` が設定されていること。  
未設定の場合はユーザーに設定を案内する。

## 画像生成方法

### CLIスクリプトで生成
```bash
pnpm image <出力先ディレクトリ> "<プロンプト>"
```

例:
```bash
pnpm image slides/report "ビジネス成長を表す右肩上がりのグラフ、フラットデザイン"
```

### スクリプトを使わず直接生成
Claude Code から `scripts/generate-image.js` の処理を直接実行してもよい。

## プロンプトのベストプラクティス

- **スタイルを指定する**: "フラットデザイン", "ミニマル", "アイソメトリック", "水彩風" など
- **用途を明示する**: "ビジネスプレゼン用", "スライドの背景用"
- **テキストは入れない**: 画像内のテキストは読めないことが多いため避ける
- **16:9を意識する**: スライドに合うアスペクト比を指示に含める

## スライドへの埋め込み

生成された画像はスライドのHTMLで以下のように使用する:

```html
<!-- フルブリード背景 -->
<div class="w-[1280px] h-[720px] relative">
  <img src="generated_xxx.png" class="absolute inset-0 w-full h-full object-cover" />
  <div class="relative z-10 p-[48px_60px]">
    <!-- コンテンツ -->
  </div>
</div>

<!-- インライン画像（左テキスト・右画像） -->
<div class="flex-1 flex gap-8">
  <div class="flex-1"><!-- テキスト --></div>
  <div class="flex-1 flex items-center justify-center">
    <img src="generated_xxx.png" class="max-h-[400px] rounded-xl shadow-lg" />
  </div>
</div>

<!-- カバースライドの背景 -->
<div class="w-[1280px] h-[720px] relative overflow-hidden">
  <img src="generated_xxx.png" class="absolute inset-0 w-full h-full object-cover opacity-20" />
  <div class="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-dark/90"></div>
  <div class="relative z-10"><!-- タイトル等 --></div>
</div>
```

## 他のスキルとの連携

スライド作成・修正時に画像が効果的な場面では、このスキルを組み合わせて使う:
- カバースライドの背景画像
- コンセプトを説明するイラスト
- データの視覚化を補助する図解
