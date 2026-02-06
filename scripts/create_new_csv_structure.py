#!/usr/bin/env python3
"""
新しいCSV構造を作成
言語ごとに分離されたファイル（並列処理に最適）
"""

import csv

# 対象言語
LANGUAGES = ["fr", "de", "es", "it", "pt", "ru", "ar", "hi", "ja", "zh"]


def create_language_files():
    """words.csvから各言語用のCSVファイルを作成"""

    # words.csvから英単語とmeaning_enを読み込む
    words = []
    with open("data/words.csv", "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            words.append({"en": row["en"], "meaning_en": row["meaning_en"]})

    print(f"✅ words.csv読み込み: {len(words)}語")

    # 各言語用のファイルを作成
    for lang in LANGUAGES:
        filename = f"data/translations_{lang}.csv"

        with open(filename, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f, delimiter="\t")

            # ヘッダー
            writer.writerow(["en", "translation", "gender", "meaning_translation"])

            # 全単語の空行を作成
            for word in words:
                writer.writerow([word["en"], "", "", ""])

        print(f"✅ {filename} 作成: {len(words)}行")

    print(f"\n✅ 完了: {len(LANGUAGES)}言語のファイルを作成")
    print("\n各ファイル構造:")
    print("  - 行数: 4,593行（ヘッダー + 4,592単語）")
    print("  - 列: en, translation, gender, meaning_translation")
    print("  - 並列処理可能: ファイルが分離されているため安全")


if __name__ == "__main__":
    create_language_files()
