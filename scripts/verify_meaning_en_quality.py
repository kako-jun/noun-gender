#!/usr/bin/env python3
"""
Phase 2 (Stage 1) 品質検証スクリプト

meaning_en列が名詞の定義になっているかチェックする。
動詞・副詞・形容詞の定義が混入していないか検出。
"""

import csv
import sys
from typing import List, Tuple

# 明確な非名詞パターン
VERB_PATTERNS = [
    "To ",
    "to ",  # 不定詞
]

GERUND_PATTERNS = [
    "Encouraging",
    "Promoting",
    "Causing",
    "Making",
    "Enabling",
    "Allowing",
    "Preventing",
    "Forcing",
    "Helping",
]

ADJECTIVE_PATTERNS = [
    "Relating to",
    "Pertaining to",
    "Involving",
    "Characteristic of",
    "Connected to",
    "Associated with",
    "Concerned with",
]

# 注意: "Forward movement" のような名詞句は除外する必要があるため、
# 副詞は非常に慎重に検出
ADVERB_PATTERNS = [
    "Out from a starting",  # "Out from a starting point" (副詞)
    "Away from a",  # "Away from a place" (副詞)
    "Into the depths",  # "Into the depths" (副詞句)
]


def check_meaning_quality(
    csv_path: str = "data/words.csv",
) -> Tuple[List[Tuple[int, str, str, str]], int]:
    """
    meaning_en列の品質をチェックする

    Returns:
        (問題のある行のリスト, 総行数)
    """
    issues = []
    total_rows = 0

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")

        for i, row in enumerate(reader, 1):
            total_rows += 1
            word = row["en"]
            meaning = row["meaning_en"]

            if not meaning.strip():
                issues.append((i, word, "EMPTY", "meaning_en is empty"))
                continue

            # セミコロンがあれば最初の意味のみチェック
            first_meaning = meaning.split(";")[0].strip()

            # チェック1: 動詞 ("To + 動詞")
            if any(first_meaning.startswith(pattern) for pattern in VERB_PATTERNS):
                issues.append((i, word, "VERB", first_meaning[:80]))
                continue

            # チェック2: 動名詞（動詞的）
            if any(first_meaning.startswith(pattern) for pattern in GERUND_PATTERNS):
                issues.append((i, word, "GERUND", first_meaning[:80]))
                continue

            # チェック3: 形容詞
            if any(first_meaning.startswith(pattern) for pattern in ADJECTIVE_PATTERNS):
                issues.append((i, word, "ADJECTIVE", first_meaning[:80]))
                continue

            # チェック4: 副詞（慎重に）
            if any(first_meaning.startswith(pattern) for pattern in ADVERB_PATTERNS):
                issues.append((i, word, "ADVERB", first_meaning[:80]))
                continue

            # チェック5: 同義語のみ（短すぎる定義）
            if len(first_meaning) < 20:
                issues.append((i, word, "TOO_SHORT", first_meaning))
                continue

            # チェック6: 同じ単語を使っている（定義になっていない）
            if word.lower() in first_meaning.lower().split():
                # 例外: "absence" in "in the absence of" は許容
                if f" {word.lower()} " in f" {first_meaning.lower()} ":
                    issues.append((i, word, "CIRCULAR", first_meaning[:80]))
                    continue

    return issues, total_rows


def main():
    """メイン処理"""
    csv_path = "data/words.csv"

    print(f"Phase 2 (Stage 1) 品質検証: {csv_path}\n")

    issues, total_rows = check_meaning_quality(csv_path)

    if not issues:
        print(f"✅ すべての meaning_en が名詞定義です！")
        print(f"   総単語数: {total_rows}")
        return 0

    print(f"❌ 問題のある定義: {len(issues)}件 / {total_rows}語\n")

    # タイプ別に集計
    by_type = {}
    for _, _, issue_type, _ in issues:
        by_type[issue_type] = by_type.get(issue_type, 0) + 1

    print("問題の内訳:")
    for issue_type, count in sorted(by_type.items()):
        print(f"  {issue_type}: {count}件")

    print("\n詳細:\n")
    for line_num, word, issue_type, meaning in issues:
        print(f"Line {line_num:4d}: {word:20s} [{issue_type}]")
        print(f"          → {meaning}\n")

    return 1


if __name__ == "__main__":
    sys.exit(main())
