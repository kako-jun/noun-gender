#!/usr/bin/env python3
"""
CSVを完全正規化された3ファイル構成に移行

旧構成:
  - word_gender_translations.csv (18列)
  - word_meaning_translations.csv (12列)
  - word_examples.csv (3列)
  - example_translations.csv (4列)

新構成:
  - words.csv (3列: en, meaning_en, example_en)
  - translations.csv (5列: en, lang, translation, gender, meaning_translation)
  - example_translations.csv (3列: en, lang, example_translation)
"""

import csv
import sys
from pathlib import Path

# 言語リスト
LANGUAGES = ["fr", "de", "es", "it", "pt", "ru", "ar", "hi", "ja", "zh"]
GENDERED_LANGUAGES = [
    "fr",
    "de",
    "es",
    "it",
    "pt",
    "ru",
    "ar",
    "hi",
]  # ja, zhは性別なし


def migrate_to_normalized():
    """CSVを正規化された構成に移行"""

    print("=" * 80)
    print("CSV正規化移行ツール")
    print("=" * 80)

    # ===== 1. words.csv 生成 =====
    print("\n[1/3] words.csv を生成中...")

    # word_examples.csv から読み込み（en, meaning_en, example_en が揃っている）
    with open("data/word_examples.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        words_data = list(reader)

    # words.csv に書き込み
    with open("data/words.csv", "w", encoding="utf-8", newline="") as f:
        fieldnames = ["en", "meaning_en", "example_en"]
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()

        for row in words_data:
            writer.writerow(
                {
                    "en": row["en"],
                    "meaning_en": row["meaning_en"],
                    "example_en": row["example_en"],
                }
            )

    print(f"   ✅ words.csv: {len(words_data)}行")

    # ===== 2. translations.csv 生成 =====
    print("\n[2/3] translations.csv を生成中...")

    # word_gender_translations.csv から gender と translation を読み込み
    with open("data/word_gender_translations.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        gender_data = {row["en"]: row for row in reader}

    # word_meaning_translations.csv から meaning_translation を読み込み
    with open("data/word_meaning_translations.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        meaning_data = {row["en"]: row for row in reader}

    translations = []

    for en in gender_data.keys():
        for lang in LANGUAGES:
            translation = ""
            gender = ""
            meaning_translation = ""

            # translation と gender を取得
            if lang in GENDERED_LANGUAGES:
                translation = gender_data[en].get(f"{lang}_translation", "")
                gender = gender_data[en].get(f"{lang}_gender", "")

            # meaning_translation を取得
            meaning_translation = meaning_data[en].get(f"meaning_{lang}", "")

            # データがある行のみ追加
            if translation or meaning_translation:
                translations.append(
                    {
                        "en": en,
                        "lang": lang,
                        "translation": translation,
                        "gender": gender,
                        "meaning_translation": meaning_translation,
                    }
                )

    # translations.csv に書き込み
    with open("data/translations.csv", "w", encoding="utf-8", newline="") as f:
        fieldnames = ["en", "lang", "translation", "gender", "meaning_translation"]
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(translations)

    print(f"   ✅ translations.csv: {len(translations)}行")

    # ===== 3. example_translations.csv 更新 =====
    print("\n[3/3] example_translations.csv を確認中...")

    # 既存の example_translations.csv を読み込み
    with open("data/example_translations.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        existing_examples = list(reader)

    # 新しいスキーマに合わせる（words_en → en, translation → example_translation）
    if existing_examples and "words_en" in existing_examples[0]:
        print("   🔄 スキーマを更新中...")

        normalized_examples = []
        for row in existing_examples:
            normalized_examples.append(
                {
                    "en": row.get("words_en", row.get("en", "")),
                    "lang": row["lang"],
                    "example_translation": row.get(
                        "translation", row.get("example_translation", "")
                    ),
                }
            )

        # 上書き保存
        with open(
            "data/example_translations.csv", "w", encoding="utf-8", newline=""
        ) as f:
            fieldnames = ["en", "lang", "example_translation"]
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
            writer.writeheader()
            writer.writerows(normalized_examples)

        print(
            f"   ✅ example_translations.csv: {len(normalized_examples)}行（スキーマ更新）"
        )
    else:
        print(
            f"   ✅ example_translations.csv: {len(existing_examples)}行（既に正規化済み）"
        )

    # ===== 統計情報 =====
    print("\n" + "=" * 80)
    print("移行完了サマリー")
    print("=" * 80)
    print(
        f"✅ words.csv:                  {len(words_data):5d}行 (en, meaning_en, example_en)"
    )
    print(
        f"✅ translations.csv:           {len(translations):5d}行 (en, lang, translation, gender, meaning_translation)"
    )
    print(
        f"✅ example_translations.csv:   {len(normalized_examples if 'normalized_examples' in locals() else existing_examples):5d}行 (en, lang, example_translation)"
    )

    total_rows = (
        len(words_data)
        + len(translations)
        + len(
            normalized_examples
            if "normalized_examples" in locals()
            else existing_examples
        )
    )
    print(f"\n総行数: {total_rows:,}行")

    # ===== 旧ファイルのバックアップ =====
    print("\n" + "=" * 80)
    print("旧ファイルのバックアップ")
    print("=" * 80)

    old_files = [
        "data/word_gender_translations.csv",
        "data/word_meaning_translations.csv",
        "data/word_examples.csv",
    ]

    backup_dir = Path("data/backup_old_schema")
    backup_dir.mkdir(exist_ok=True)

    import shutil

    for old_file in old_files:
        if Path(old_file).exists():
            backup_path = backup_dir / Path(old_file).name
            shutil.copy2(old_file, backup_path)
            print(f"   📦 {old_file} → {backup_path}")

    print("\n✅ 移行完了！")
    print("\n次のステップ:")
    print("  1. 新しいCSVを確認: head data/words.csv data/translations.csv")
    print("  2. D1スキーマを更新: scripts/d1_schema.sql")
    print("  3. D1に同期: ./scripts/d1_reset.sh")
    print("  4. 旧ファイルを削除: rm data/word_*.csv")


if __name__ == "__main__":
    migrate_to_normalized()
