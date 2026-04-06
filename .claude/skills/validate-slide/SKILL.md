---
name: スライドバリデーション
description: This skill should be used when the user asks to "スライドをチェック", "バリデーション", "はみ出しチェック", "レイアウト確認", or mentions checking slides for overflow, overlap, or layout issues.
version: 1.0.0
---

# スライドバリデーションスキル

スライドのはみ出し・重なり・余白不足をチェックし、問題があれば自動修正する。

## ワークフロー

1. `pnpm validate slides/{deck}` を実行
2. エラーがあれば該当スライドを読み、修正を適用
3. 再度バリデーション実行
4. 全スライドが正常になるまで繰り返す
