#!/usr/bin/env python3
"""
翻訳の完全性を検証
使用例: python verify_translations.py fr 1 230
"""

import csv
import sys


def verify(lang, start, end):
    """指定範囲の翻訳が完了しているか検証"""
    filename = f"data/translations_{lang}.csv"

    try:
        with open(filename, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")

            missing = []
            invalid_gender = []

            for i, row in enumerate(reader, 1):
                if start <= i <= end:
                    en = row["en"]
                    translation = row.get("translation", "").strip()
                    gender = row.get("gender", "").strip()

                    if not translation or not gender:
                        missing.append(f"Line {i}: {en}")
                    elif gender not in ["m", "f", "n"]:
                        invalid_gender.append(f"Line {i}: {en} (gender='{gender}')")

            total = end - start + 1
            filled = total - len(missing)

            if missing:
                print(f"❌ {lang.upper()}[{start}:{end}] 未完了: {len(missing)}語")
                print(f"   完了: {filled}/{total} ({filled / total * 100:.1f}%)")
                print("\n未完了単語（最初の10語）:")
                for m in missing[:10]:
                    print(f"  {m}")
                return False
            elif invalid_gender:
                print(
                    f"⚠️  {lang.upper()}[{start}:{end}] 性別エラー: {len(invalid_gender)}語"
                )
                for ig in invalid_gender[:10]:
                    print(f"  {ig}")
                return False
            else:
                print(f"✅ {lang.upper()}[{start}:{end}] 完全完了: {total}語")
                return True

    except FileNotFoundError:
        print(f"❌ ファイルが見つかりません: {filename}")
        return False
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("使用方法: python verify_translations.py <lang> <start> <end>")
        print("例: python verify_translations.py fr 1 230")
        sys.exit(1)

    lang = sys.argv[1]
    start = int(sys.argv[2])
    end = int(sys.argv[3])

    print(f"\n検証中: {lang.upper()} 行{start}～{end}...")
    success = verify(lang, start, end)

    sys.exit(0 if success else 1)
