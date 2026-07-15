#!/usr/bin/env python3
"""CSV → Cloudflare D1 同期スクリプト（現行スキーマ対応）

data/ の正本CSV（タブ区切り）から D1 の各テーブルに INSERT する。
削除は行わない（全削除→全挿入の運用は scripts/d1_sync_all.sh が担当）。

入力 → 出力の対応:
    words.csv                  → words_en, examples, word_meanings (meaning_en)
    translations_{8言語}.csv   → words_{lang} (translation, gender)
    translations_{10言語}.csv  → word_meanings (meaning_{lang})
    example_translations.csv   → example_translations (en を example_en 本文に解決)
    memory_tricks_creation.csv → memory_tricks (status=ready の行のみ)

Usage:
    uv run python3 scripts/sync_to_d1.py [--dry-run] [--table TABLE]

Options:
    --dry-run   SQL生成と統計表示のみで、D1には実行しない
    --table     特定テーブルのみ同期 (words_en, words_fr, ..., word_meanings,
                examples, example_translations, memory_tricks, gender_markers)
"""

import argparse
import csv
import subprocess
import sys
import tempfile
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
D1_DATABASE = "noun-gender-db"

GENDER_LANGS = ["fr", "de", "es", "it", "pt", "ru", "ar", "hi"]
ALL_LANGS = GENDER_LANGS + ["ja", "zh"]

# D1 は1リクエストのステートメント数に上限があるため分割する
BATCH_SIZE = 500


def esc(value: str | None) -> str:
    """SQL文字列リテラル化（空はNULL）"""
    if value is None or value == "":
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def read_tsv(name: str) -> list[dict]:
    with open(DATA_DIR / name, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f, delimiter="\t", quoting=csv.QUOTE_NONE))


def execute_batches(label: str, statements: list[str], dry_run: bool) -> bool:
    """INSERT文リストをBATCH_SIZEごとのSQLファイルに分割してD1に実行"""
    n_batches = (len(statements) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"  {label}: {len(statements)} 行 / {n_batches} バッチ")
    if dry_run:
        return True
    for b in range(n_batches):
        chunk = statements[b * BATCH_SIZE : (b + 1) * BATCH_SIZE]
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".sql", delete=False, encoding="utf-8"
        ) as f:
            f.write("\n".join(chunk))
            sql_file = f.name
        try:
            result = subprocess.run(
                ["npx", "wrangler", "d1", "execute", D1_DATABASE,
                 "--remote", f"--file={sql_file}"],
                capture_output=True, text=True, cwd=PROJECT_ROOT,
            )
            if result.returncode != 0:
                print(f"  ERROR (batch {b + 1}/{n_batches}): {result.stderr}")
                return False
        finally:
            Path(sql_file).unlink()
        print(f"  batch {b + 1}/{n_batches} done")
    return True


def sync_gender_markers(dry_run: bool) -> bool:
    print("Syncing gender_markers...")
    stmts = [
        "INSERT OR REPLACE INTO gender_markers VALUES('m','Masculine','男性','Masculine gender marker');",
        "INSERT OR REPLACE INTO gender_markers VALUES('f','Feminine','女性','Feminine gender marker');",
        "INSERT OR REPLACE INTO gender_markers VALUES('n','Neuter','中性','Neuter gender marker');",
        "INSERT OR REPLACE INTO gender_markers VALUES('pl','Plural only','複数形のみ','Plurale tantum marker');",
    ]
    return execute_batches("gender_markers", stmts, dry_run)


def sync_words_en(words: list[dict], dry_run: bool) -> bool:
    print("Syncing words_en...")
    stmts = [
        f"INSERT OR REPLACE INTO words_en (id, en) VALUES ({i + 1}, {esc(r['en'])});"
        for i, r in enumerate(words)
    ]
    return execute_batches("words_en", stmts, dry_run)


def sync_examples(words: list[dict], dry_run: bool) -> bool:
    print("Syncing examples...")
    stmts = [
        f"INSERT OR REPLACE INTO examples (en, example_en) "
        f"VALUES ({esc(r['en'])}, {esc(r['example_en'].strip())});"
        for r in words if r["example_en"].strip()
    ]
    return execute_batches("examples", stmts, dry_run)


def sync_language_table(lang: str, dry_run: bool) -> bool:
    print(f"Syncing words_{lang}...")
    rows = read_tsv(f"translations_{lang}.csv")
    stmts = []
    for i, r in enumerate(rows):
        translation = r["translation"].strip()
        if not translation:
            continue
        gender = r["gender"].strip().lower() or None
        stmts.append(
            f"INSERT OR REPLACE INTO words_{lang} (id, en, translation, gender) "
            f"VALUES ({i + 1}, {esc(r['en'])}, {esc(translation)}, {esc(gender)});"
        )
    return execute_batches(f"words_{lang}", stmts, dry_run)


def sync_word_meanings(words: list[dict], dry_run: bool) -> bool:
    """meaning_en + 全10言語の meaning_translation を word_meanings に集約"""
    print("Syncing word_meanings...")
    meanings = {r["en"]: {"meaning_en": r["meaning_en"].strip()} for r in words}
    for lang in ALL_LANGS:
        for r in read_tsv(f"translations_{lang}.csv"):
            if r["en"] in meanings:
                meanings[r["en"]][f"meaning_{lang}"] = r["meaning_translation"].strip()
    cols = ["meaning_en"] + [f"meaning_{lang}" for lang in ALL_LANGS]
    stmts = []
    for r in words:
        m = meanings[r["en"]]
        values = ", ".join(esc(m.get(c, "")) for c in cols)
        stmts.append(
            f"INSERT OR REPLACE INTO word_meanings (en, {', '.join(cols)}) "
            f"VALUES ({esc(r['en'])}, {values});"
        )
    return execute_batches("word_meanings", stmts, dry_run)


def sync_example_translations(words: list[dict], dry_run: bool) -> bool:
    """example_translations テーブルは英語例文本文 (example_en) がキー"""
    print("Syncing example_translations...")
    example_by_en = {r["en"]: r["example_en"].strip() for r in words}
    stmts = []
    skipped = 0
    for r in read_tsv("example_translations.csv"):
        text = r["example_translation"].strip()
        if not text:
            continue
        example_en = example_by_en.get(r["en"], "")
        if not example_en:
            skipped += 1
            continue
        stmts.append(
            f"INSERT OR REPLACE INTO example_translations (example_en, lang, translation) "
            f"VALUES ({esc(example_en)}, {esc(r['lang'])}, {esc(text)});"
        )
    if skipped:
        print(f"  WARNING: 対応する example_en が無くスキップ {skipped} 件")
    return execute_batches("example_translations", stmts, dry_run)


def sync_memory_tricks(dry_run: bool) -> bool:
    print("Syncing memory_tricks...")
    stmts = []
    for r in read_tsv("memory_tricks_creation.csv"):
        if r.get("status", "").strip() != "ready":
            continue
        trick = r["trick_text_translated"].strip() or r["trick_text_en"].strip()
        if not trick:
            continue
        stmts.append(
            f"INSERT OR REPLACE INTO memory_tricks (en, translation_lang, ui_lang, trick_text) "
            f"VALUES ({esc(r['en'])}, {esc(r['target_lang'])}, {esc(r['ui_lang'])}, {esc(trick)});"
        )
    return execute_batches("memory_tricks", stmts, dry_run)


def main() -> int:
    parser = argparse.ArgumentParser(description="CSV → D1 sync")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--table")
    args = parser.parse_args()

    if args.dry_run:
        print("[DRY-RUN] D1 には実行しません\n")

    words = read_tsv("words.csv")
    print(f"words.csv: {len(words)} 行\n")

    tasks: list[tuple] = [("gender_markers", lambda: sync_gender_markers(args.dry_run)),
                          ("words_en", lambda: sync_words_en(words, args.dry_run))]
    for lang in GENDER_LANGS:
        tasks.append((f"words_{lang}",
                      lambda lang=lang: sync_language_table(lang, args.dry_run)))
    tasks += [
        ("examples", lambda: sync_examples(words, args.dry_run)),
        ("word_meanings", lambda: sync_word_meanings(words, args.dry_run)),
        ("example_translations", lambda: sync_example_translations(words, args.dry_run)),
        ("memory_tricks", lambda: sync_memory_tricks(args.dry_run)),
    ]

    ok = True
    for name, fn in tasks:
        if args.table and name != args.table:
            continue
        if not fn():
            ok = False
            break

    print("\n" + ("Sync complete!" if ok else "Sync FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
