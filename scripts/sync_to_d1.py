#!/usr/bin/env python3
"""
CSV to Cloudflare D1 Sync Script

CSVファイルからCloudflare D1にデータを同期するスクリプト。
外部キー制約を考慮した順序でデータを挿入・更新・削除する。

Usage:
    python scripts/sync_to_d1.py [--dry-run] [--table TABLE_NAME]

Options:
    --dry-run       SQLファイルを生成するが、D1には実行しない
    --table         特定のテーブルのみ同期（words_en, words_fr, etc.）
"""

import csv
import subprocess
import sys
import tempfile
from pathlib import Path

# プロジェクトルート
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"

# D1データベース名
D1_DATABASE = "noun-gender-db"

def escape_sql(value: str) -> str:
    """SQL用にエスケープ"""
    if value is None or value == "":
        return "NULL"
    return "'" + value.replace("'", "''") + "'"

def run_d1_sql(sql: str, dry_run: bool = False) -> bool:
    """D1にSQLを実行"""
    if dry_run:
        print(f"[DRY-RUN] SQL:\n{sql[:500]}...")
        return True

    with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
        f.write(sql)
        sql_file = f.name

    try:
        result = subprocess.run(
            ["npx", "wrangler", "d1", "execute", D1_DATABASE, "--remote", f"--file={sql_file}"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        if "ERROR" in result.stdout:
            print(f"SQL Error: {result.stdout}")
            return False
        return True
    finally:
        Path(sql_file).unlink()

def sync_words_en(dry_run: bool = False) -> bool:
    """words_enテーブルを同期"""
    print("Syncing words_en...")

    csv_file = DATA_DIR / "word_gender_translations.csv"
    words = set()

    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            if row.get("en"):
                words.add(row["en"].strip().lower())

    # INSERT OR REPLACE で全単語を挿入
    sql_lines = []
    for i, word in enumerate(sorted(words)):
        sql_lines.append(f"INSERT OR REPLACE INTO words_en (id, en) VALUES ({i+1}, {escape_sql(word)});")

    sql = "\n".join(sql_lines)
    print(f"  {len(words)} words to sync")

    return run_d1_sql(sql, dry_run)

def sync_gender_markers(dry_run: bool = False) -> bool:
    """gender_markersテーブルを同期"""
    print("Syncing gender_markers...")

    sql = """
INSERT OR REPLACE INTO gender_markers VALUES('m','Masculine','男性','Masculine gender marker');
INSERT OR REPLACE INTO gender_markers VALUES('f','Feminine','女性','Feminine gender marker');
INSERT OR REPLACE INTO gender_markers VALUES('n','Neuter','中性','Neuter gender marker');
"""
    return run_d1_sql(sql, dry_run)

def sync_language_table(lang: str, dry_run: bool = False) -> bool:
    """各言語テーブルを同期"""
    print(f"Syncing words_{lang}...")

    csv_file = DATA_DIR / "word_gender_translations.csv"
    col_translation = f"{lang}_translation"
    col_gender = f"{lang}_gender"

    sql_lines = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            en = row.get("en", "").strip().lower()
            translation = row.get(col_translation, "").strip()
            gender = row.get(col_gender, "").strip().lower()

            if not en or not translation:
                continue

            # genderが空または無効な場合はNULL
            if gender not in ("m", "f", "n"):
                gender = None

            sql_lines.append(
                f"INSERT OR REPLACE INTO words_{lang} (id, en, translation, gender, confidence_score) "
                f"VALUES ({i+1}, {escape_sql(en)}, {escape_sql(translation)}, {escape_sql(gender)}, 100);"
            )

    sql = "\n".join(sql_lines)
    print(f"  {len(sql_lines)} records to sync")

    return run_d1_sql(sql, dry_run)

def sync_word_meanings(dry_run: bool = False) -> bool:
    """word_meaningsテーブルを同期"""
    print("Syncing word_meanings...")

    csv_file = DATA_DIR / "word_meaning_translations.csv"

    sql_lines = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            en = row.get("en", "").strip().lower()
            if not en:
                continue

            values = [
                str(i+1),
                escape_sql(en),
                escape_sql(row.get("meaning_en", "")),
                escape_sql(row.get("meaning_ja", "")),
                escape_sql(row.get("meaning_zh", "")),
                escape_sql(row.get("meaning_fr", "")),
                escape_sql(row.get("meaning_de", "")),
                escape_sql(row.get("meaning_es", "")),
                escape_sql(row.get("meaning_it", "")),
                escape_sql(row.get("meaning_pt", "")),
                escape_sql(row.get("meaning_ru", "")),
                escape_sql(row.get("meaning_ar", "")),
                escape_sql(row.get("meaning_hi", "")),
            ]

            sql_lines.append(
                f"INSERT OR REPLACE INTO word_meanings "
                f"(id, en, meaning_en, meaning_ja, meaning_zh, meaning_fr, meaning_de, meaning_es, "
                f"meaning_it, meaning_pt, meaning_ru, meaning_ar, meaning_hi) "
                f"VALUES ({', '.join(values)});"
            )

    sql = "\n".join(sql_lines)
    print(f"  {len(sql_lines)} records to sync")

    return run_d1_sql(sql, dry_run)

def sync_examples(dry_run: bool = False) -> bool:
    """examplesテーブルを同期"""
    print("Syncing examples...")

    csv_file = DATA_DIR / "word_examples.csv"

    sql_lines = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            en = row.get("en", "").strip().lower()
            example_en = row.get("example_en", "").strip()

            if not en or not example_en:
                continue

            sql_lines.append(
                f"INSERT OR REPLACE INTO examples (id, en, example_en) "
                f"VALUES ({i+1}, {escape_sql(en)}, {escape_sql(example_en)});"
            )

    sql = "\n".join(sql_lines)
    print(f"  {len(sql_lines)} records to sync")

    return run_d1_sql(sql, dry_run)

def sync_example_translations(dry_run: bool = False) -> bool:
    """example_translationsテーブルを同期"""
    print("Syncing example_translations...")

    csv_file = DATA_DIR / "example_translations.csv"

    sql_lines = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            example_en = row.get("example_en", "").strip()
            lang = row.get("lang", "").strip()
            translation = row.get("translation", "").strip()

            if not example_en or not lang or not translation:
                continue

            sql_lines.append(
                f"INSERT OR REPLACE INTO example_translations (id, example_en, lang, translation) "
                f"VALUES ({i+1}, {escape_sql(example_en)}, {escape_sql(lang)}, {escape_sql(translation)});"
            )

    sql = "\n".join(sql_lines)
    print(f"  {len(sql_lines)} records to sync")

    return run_d1_sql(sql, dry_run)

def sync_memory_tricks(dry_run: bool = False) -> bool:
    """memory_tricksテーブルを同期"""
    print("Syncing memory_tricks...")

    csv_file = DATA_DIR / "memory_tricks_creation.csv"
    if not csv_file.exists():
        print("  No memory_tricks CSV found, skipping")
        return True

    sql_lines = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for i, row in enumerate(reader):
            en = row.get("en", "").strip().lower()
            translation_lang = row.get("translation_lang", "").strip()
            ui_lang = row.get("ui_lang", "").strip()
            trick_text = row.get("trick_text", "").strip()

            if not en or not translation_lang or not ui_lang or not trick_text:
                continue

            sql_lines.append(
                f"INSERT OR REPLACE INTO memory_tricks (id, en, translation_lang, ui_lang, trick_text) "
                f"VALUES ({i+1}, {escape_sql(en)}, {escape_sql(translation_lang)}, "
                f"{escape_sql(ui_lang)}, {escape_sql(trick_text)});"
            )

    sql = "\n".join(sql_lines)
    print(f"  {len(sql_lines)} records to sync")

    return run_d1_sql(sql, dry_run)

def sync_all(dry_run: bool = False) -> bool:
    """全テーブルを同期（外部キー制約を考慮した順序）"""
    print("=" * 50)
    print("Syncing all tables to D1")
    print("=" * 50)

    # 1. マスターテーブル
    if not sync_words_en(dry_run):
        return False
    if not sync_gender_markers(dry_run):
        return False

    # 2. 言語テーブル
    for lang in ["fr", "de", "es", "it", "pt", "ru", "ar", "hi"]:
        if not sync_language_table(lang, dry_run):
            return False

    # 3. 意味・例文テーブル
    if not sync_word_meanings(dry_run):
        return False
    if not sync_examples(dry_run):
        return False
    if not sync_example_translations(dry_run):
        return False
    if not sync_memory_tricks(dry_run):
        return False

    print("=" * 50)
    print("All tables synced successfully!")
    print("=" * 50)
    return True

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Sync CSV to D1")
    parser.add_argument("--dry-run", action="store_true", help="Generate SQL but don't execute")
    parser.add_argument("--table", type=str, help="Sync specific table only")
    args = parser.parse_args()

    if args.table:
        table = args.table.lower()
        if table == "words_en":
            success = sync_words_en(args.dry_run)
        elif table == "gender_markers":
            success = sync_gender_markers(args.dry_run)
        elif table.startswith("words_"):
            lang = table.replace("words_", "")
            success = sync_language_table(lang, args.dry_run)
        elif table == "word_meanings":
            success = sync_word_meanings(args.dry_run)
        elif table == "examples":
            success = sync_examples(args.dry_run)
        elif table == "example_translations":
            success = sync_example_translations(args.dry_run)
        elif table == "memory_tricks":
            success = sync_memory_tricks(args.dry_run)
        else:
            print(f"Unknown table: {table}")
            sys.exit(1)
    else:
        success = sync_all(args.dry_run)

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
