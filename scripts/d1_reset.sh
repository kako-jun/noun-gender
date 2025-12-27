#!/bin/bash
# D1 Reset Script
# スキーマを再作成してからCSVデータを同期する

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "D1 Database Reset"
echo "=============================================="

# スキーマを適用
echo ""
echo "Step 1: Applying schema..."
npx wrangler d1 execute noun-gender-db --remote --file="$SCRIPT_DIR/d1_schema.sql"

echo ""
echo "Step 2: Syncing data from CSV..."
python3 "$SCRIPT_DIR/sync_to_d1.py"

echo ""
echo "=============================================="
echo "D1 Reset Complete!"
echo "=============================================="

# 最終確認
echo ""
echo "Verifying record counts..."
npx wrangler d1 execute noun-gender-db --remote --command "SELECT 'words_en' as tbl, COUNT(*) as cnt FROM words_en;" 2>&1 | grep -A3 '"results"'
