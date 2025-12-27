#!/bin/bash
# D1 Full Sync Script
# 全テーブルのデータを削除してCSVから再挿入する
# スキーマは変更しない

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_NAME="noun-gender-db"

echo "=============================================="
echo "D1 Full Sync (Delete All + Insert All)"
echo "=============================================="

# Step 1: 全データ削除（依存関係の逆順）
echo ""
echo "Step 1: Deleting all data..."

npx wrangler d1 execute $DB_NAME --remote --command "DELETE FROM example_translations;"
echo "  - example_translations deleted"

npx wrangler d1 execute $DB_NAME --remote --command "DELETE FROM examples;"
echo "  - examples deleted"

npx wrangler d1 execute $DB_NAME --remote --command "DELETE FROM word_meanings;"
echo "  - word_meanings deleted"

npx wrangler d1 execute $DB_NAME --remote --command "DELETE FROM memory_tricks;"
echo "  - memory_tricks deleted"

for lang in fr de es it pt ru ar hi; do
  npx wrangler d1 execute $DB_NAME --remote --command "DELETE FROM words_${lang};"
  echo "  - words_${lang} deleted"
done

npx wrangler d1 execute $DB_NAME --remote --command "DELETE FROM words_en;"
echo "  - words_en deleted"

# gender_markersは固定値なので削除しない

# Step 2: CSVからデータ挿入
echo ""
echo "Step 2: Inserting data from CSV..."
python3 "$SCRIPT_DIR/sync_to_d1.py"

echo ""
echo "=============================================="
echo "Full Sync Complete!"
echo "=============================================="

# 確認
echo ""
echo "Record counts:"
for tbl in words_en words_fr word_meanings examples example_translations; do
  count=$(npx wrangler d1 execute $DB_NAME --remote --command "SELECT COUNT(*) as c FROM $tbl;" 2>&1 | grep -o '"c": [0-9]*' | grep -o '[0-9]*')
  echo "  $tbl: $count"
done
