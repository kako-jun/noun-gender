# 開発メモ

データ関連の正本仕様は [docs/data-pipeline.md](../docs/data-pipeline.md) を参照。

- CSVスキーマ・二層言語モデル・コンテンツ規則
- バッチ規律（100語以下・コミット前に `uv run python3 scripts/validate.py`）
- D1同期手順（`./scripts/d1_sync_all.sh`）
