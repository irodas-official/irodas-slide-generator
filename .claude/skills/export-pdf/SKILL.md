---
name: PDF出力
description: This skill should be used when the user asks to "PDFにして", "PDF出力", "PDFエクスポート", "スライドを共有したい", or mentions exporting or converting slides to PDF.
version: 1.0.0
---

# PDF出力スキル

スライドデッキをPDFに変換する。

## ワークフロー

1. `pnpm validate slides/{deck}` でチェック
2. 問題があれば先に修正
3. `pnpm export-pdf slides/{deck}` でPDF出力
4. 出力先（output/ディレクトリ）を報告
