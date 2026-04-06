---
name: スライド修正
description: This skill should be used when the user asks to "スライドを修正", "スライドを直して", "ここを変更して", "グラフを大きく", "色を変えて", or mentions editing, fixing, or updating an existing slide.
version: 1.0.0
---

# スライド修正スキル

既存スライドの修正を行う。

## ワークフロー

1. **対象のスライドファイルだけ**を読む（他のスライドは読まない）
2. 修正を適用
3. `pnpm validate` でそのスライドだけ検証
4. 問題があれば自動修正して再チェック
5. 必要に応じてviewer.htmlのnotesを更新
