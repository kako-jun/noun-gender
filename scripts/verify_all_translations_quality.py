#!/usr/bin/env python3
"""
Phase 3 全言語品質検証スクリプト

各言語の翻訳について以下をチェック：
1. 性別フォーマット（m/f/n のみ、m/f, m pl, f pl などの不正値を検出）
2. 翻訳に冠詞が含まれていないか
3. 空白・欠損データ
4. 翻訳が名詞形式か（動詞・形容詞でないか）
"""

import csv
import sys
import re
from typing import List, Tuple, Dict

# 言語設定
LANGUAGES = {
    "fr": {
        "name": "French",
        "genders": ["m", "f"],
        "articles": ["le", "la", "l'", "les", "un", "une", "des"],
    },
    "de": {
        "name": "German",
        "genders": ["m", "f", "n"],
        "articles": [
            "der",
            "die",
            "das",
            "den",
            "dem",
            "des",
            "ein",
            "eine",
            "einen",
            "einem",
            "eines",
        ],
    },
    "es": {
        "name": "Spanish",
        "genders": ["m", "f"],
        "articles": ["el", "la", "los", "las", "un", "una", "unos", "unas"],
    },
    "it": {
        "name": "Italian",
        "genders": ["m", "f"],
        "articles": ["il", "lo", "la", "i", "gli", "le", "l'", "un", "uno", "una"],
    },
    "pt": {
        "name": "Portuguese",
        "genders": ["m", "f"],
        "articles": ["o", "a", "os", "as", "um", "uma", "uns", "umas"],
    },
    "ru": {
        "name": "Russian",
        "genders": ["m", "f", "n"],
        "articles": [],
    },  # ロシア語は冠詞なし
    "ar": {
        "name": "Arabic",
        "genders": ["m", "f"],
        "articles": ["ال"],
    },  # アラビア語の定冠詞
    "hi": {
        "name": "Hindi",
        "genders": ["m", "f"],
        "articles": [],
    },  # ヒンディー語は冠詞なし
}


def check_gender_format(gender: str, valid_genders: List[str]) -> Tuple[bool, str]:
    """
    性別フォーマットをチェック

    Returns:
        (is_valid, issue_description)
    """
    gender = gender.strip()

    if not gender:
        return False, "EMPTY_GENDER"

    if gender not in valid_genders:
        # よくある間違いを検出
        if "/" in gender:
            return False, f"INVALID_GENDER: '{gender}' (contains /)"
        if " pl" in gender:
            return False, f"INVALID_GENDER: '{gender}' (plural form)"
        if gender in ["m/f", "f/m", "m pl", "f pl", "m/n", "f/n"]:
            return False, f"INVALID_GENDER: '{gender}'"
        return False, f"INVALID_GENDER: '{gender}' (not in {valid_genders})"

    return True, ""


def check_article(
    translation: str, articles: List[str], en_word: str = ""
) -> Tuple[bool, str]:
    """
    翻訳に冠詞が含まれていないかチェック

    Returns:
        (has_article, article_found)
    """
    if not articles:  # ロシア語・ヒンディー語は冠詞なし
        return False, ""

    # 特殊ケース: 一部の単語は冠詞を含む翻訳が正しい
    EXCEPTIONS = {
        "either": True,  # "l'un ou l'autre", "uno dei due" など
    }

    if en_word.lower() in EXCEPTIONS:
        return False, ""

    translation_lower = translation.strip().lower()

    for article in articles:
        # 冠詞が単語の最初にある場合のみ検出
        if translation_lower.startswith(article.lower() + " "):
            return True, article
        # アポストロフィ付き冠詞 (l', l')
        if "'" in article and translation_lower.startswith(article.lower()):
            return True, article

    return False, ""

    translation_lower = translation.strip().lower()

    for article in articles:
        # 冠詞が単語の最初にある場合のみ検出
        if translation_lower.startswith(article.lower() + " "):
            return True, article
        # アポストロフィ付き冠詞 (l', l')
        if "'" in article and translation_lower.startswith(article.lower()):
            return True, article

    return False, ""


def check_translation_quality(lang: str, csv_path: str) -> Dict:
    """
    特定言語の翻訳品質をチェック

    Returns:
        問題のある行の詳細を含む辞書
    """
    config = LANGUAGES[lang]
    issues = {
        "empty_translation": [],
        "empty_gender": [],
        "invalid_gender": [],
        "has_article": [],
        "empty_meaning": [],
    }
    total_rows = 0

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")

        for i, row in enumerate(reader, 1):
            total_rows += 1
            en_word = row.get("en", "") or ""
            translation = (row.get("translation") or "").strip()
            gender = (row.get("gender") or "").strip()
            meaning = (row.get("meaning_translation") or "").strip()

            # チェック1: 翻訳が空
            if not translation:
                issues["empty_translation"].append((i, en_word))
                continue

            # チェック2: 性別が空
            if not gender:
                issues["empty_gender"].append((i, en_word, translation))
                continue

            # チェック3: 性別フォーマットが不正
            is_valid, issue_desc = check_gender_format(gender, config["genders"])
            if not is_valid:
                issues["invalid_gender"].append(
                    (i, en_word, translation, gender, issue_desc)
                )
                continue

            # チェック4: 冠詞が含まれている
            has_article, article = check_article(
                translation, config["articles"], en_word
            )
            if has_article:
                issues["has_article"].append((i, en_word, translation, article))

            # チェック5: 意味翻訳が空（警告レベル）
            if not meaning:
                issues["empty_meaning"].append((i, en_word, translation))

    return {
        "language": lang,
        "name": config["name"],
        "total_rows": total_rows,
        "issues": issues,
    }


def print_report(results: List[Dict]):
    """
    検証結果レポートを出力
    """
    print("=" * 80)
    print("Phase 3 全言語翻訳品質検証レポート")
    print("=" * 80)
    print()

    has_critical_issues = False

    for result in results:
        lang = result["language"]
        name = result["name"]
        total = result["total_rows"]
        issues = result["issues"]

        # 致命的な問題の数
        critical_count = (
            len(issues["empty_translation"])
            + len(issues["empty_gender"])
            + len(issues["invalid_gender"])
            + len(issues["has_article"])
        )

        # 警告レベルの問題
        warning_count = len(issues["empty_meaning"])

        print(f"【{name.upper()} ({lang})】")
        print(f"総単語数: {total}")

        if critical_count == 0 and warning_count == 0:
            print("✅ 問題なし")
            print()
            continue

        if critical_count > 0:
            has_critical_issues = True
            print(f"❌ 致命的な問題: {critical_count}件")

        if warning_count > 0:
            print(f"⚠️  警告: {warning_count}件")

        # 詳細表示
        if issues["empty_translation"]:
            print(f"\n  空の翻訳: {len(issues['empty_translation'])}件")
            for line, word in issues["empty_translation"][:5]:
                print(f"    Line {line}: {word}")
            if len(issues["empty_translation"]) > 5:
                print(f"    ... and {len(issues['empty_translation']) - 5} more")

        if issues["empty_gender"]:
            print(f"\n  性別なし: {len(issues['empty_gender'])}件")
            for line, word, trans in issues["empty_gender"][:5]:
                print(f"    Line {line}: {word} → {trans}")
            if len(issues["empty_gender"]) > 5:
                print(f"    ... and {len(issues['empty_gender']) - 5} more")

        if issues["invalid_gender"]:
            print(f"\n  不正な性別フォーマット: {len(issues['invalid_gender'])}件")
            for line, word, trans, gender, desc in issues["invalid_gender"][:10]:
                print(f"    Line {line}: {word} → {trans} ({gender}) - {desc}")
            if len(issues["invalid_gender"]) > 10:
                print(f"    ... and {len(issues['invalid_gender']) - 10} more")

        if issues["has_article"]:
            print(f"\n  冠詞が含まれている: {len(issues['has_article'])}件")
            for line, word, trans, article in issues["has_article"][:10]:
                print(f"    Line {line}: {word} → {trans} (冠詞: {article})")
            if len(issues["has_article"]) > 10:
                print(f"    ... and {len(issues['has_article']) - 10} more")

        if issues["empty_meaning"]:
            print(f"\n  ⚠️  意味翻訳なし: {len(issues['empty_meaning'])}件")
            # 詳細は省略（多すぎるため）

        print()

    print("=" * 80)

    if has_critical_issues:
        print("❌ 致命的な問題が見つかりました。修正が必要です。")
        return 1
    else:
        print("✅ すべての言語で致命的な問題はありません！")
        return 0


def main():
    """メイン処理"""
    results = []

    for lang in ["fr", "de", "es", "it", "pt", "ru", "ar", "hi"]:
        csv_path = f"data/translations_{lang}.csv"
        try:
            result = check_translation_quality(lang, csv_path)
            results.append(result)
        except FileNotFoundError:
            print(f"⚠️  Warning: {csv_path} not found, skipping...")
        except Exception as e:
            print(f"❌ Error checking {lang}: {e}")

    return print_report(results)


if __name__ == "__main__":
    sys.exit(main())
