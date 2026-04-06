# irodas スライドジェネレーター

HTMLスライド生成システム。1スライド1ファイルで管理し、Tailwind CSSで自己完結。

## 構成
- `slides/{deck}/` — スライドデッキ（slide_01.html〜 + viewer.html）
- `templates/` — レイアウトテンプレート
- `themes/irodas.json` — デザインテーマ定義
- `scripts/` — validate / export-pdf / new-slide

## コマンド
- `pnpm generate {deck}` — 新規デッキ作成
- `pnpm dev {deck}` — ブラウザでプレビュー
- `pnpm validate slides/{deck}` — はみ出し・重なりチェック
- `pnpm image slides/{deck} "プロンプト"` — 画像生成（要 GEMINI_API_KEY）
- `pnpm export-pdf slides/{deck}` — PDF出力

## セキュリティ
- `.env` ファイルの中身を絶対に読み取らないこと
- APIキーや秘密情報をコード内にハードコードしないこと
- `.env` の内容をログ出力やレスポンスに含めないこと
