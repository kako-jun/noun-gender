#!/usr/bin/env python3
"""
進捗管理ヘルパースクリプト
使い方:
  python scripts/progress_manager.py init stage1           # 進捗ファイル初期化
  python scripts/progress_manager.py show                  # 全ステージ進捗表示
  python scripts/progress_manager.py show stage1           # 特定ステージ詳細表示
  python scripts/progress_manager.py reset stage1 abbey    # 特定単語をリセット
"""

import json
import csv
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional

PROGRESS_DIR = Path(".claude/workflow/progress")
CHECKPOINT_DIR = Path(".claude/workflow/checkpoints")
CSV_FILES = {
    "stage1": "data/word_gender_translations.csv",
    "stage2": "data/word_examples.csv",
    "stage3": "data/word_gender_translations.csv",
    "stage4": "data/word_meaning_translations.csv",
}


def load_progress(stage: str, language: Optional[str] = None) -> Dict:
    """進捗を読み込み"""
    if language:
        filename = f"{stage}-{language}.jsonl"
    else:
        filename = f"{stage}.jsonl"

    progress_file = PROGRESS_DIR / filename

    if not progress_file.exists():
        return {}

    progress = {}
    with open(progress_file, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                record = json.loads(line)
                progress[record["en"]] = record

    return progress


def save_progress(stage: str, progress: Dict, language: Optional[str] = None):
    """進捗を保存"""
    if language:
        filename = f"{stage}-{language}.jsonl"
    else:
        filename = f"{stage}.jsonl"

    progress_file = PROGRESS_DIR / filename
    progress_file.parent.mkdir(parents=True, exist_ok=True)

    with open(progress_file, "w", encoding="utf-8") as f:
        for record in progress.values():
            f.write(json.dumps(record, ensure_ascii=False) + "\n")


def init_progress(stage: str, language: Optional[str] = None):
    """進捗ファイルを初期化"""
    # CSVファイルを決定
    if stage.startswith("stage3"):
        csv_file = CSV_FILES["stage3"]
    elif stage.startswith("stage4"):
        csv_file = CSV_FILES["stage4"]
    else:
        csv_file = CSV_FILES.get(stage)

    if not csv_file:
        print(f"❌ 不明なステージ: {stage}")
        return

    # 単語リストを読み込み
    words = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        words = [row["en"] for row in reader]

    # 進捗ファイル初期化
    progress = {}
    for word in words:
        progress[word] = {"en": word, "status": "pending"}

    save_progress(stage, progress, language)

    stage_name = f"{stage}-{language}" if language else stage
    print(f"✅ 進捗ファイル初期化: {stage_name} ({len(words)}語)")


def show_summary():
    """全ステージの進捗を表示"""
    print("\n" + "=" * 80)
    print("進捗サマリー")
    print("=" * 80)

    if not PROGRESS_DIR.exists():
        print("⚠️ 進捗ファイルが存在しません")
        return

    total_all = 0
    completed_all = 0

    for progress_file in sorted(PROGRESS_DIR.glob("*.jsonl")):
        stage = progress_file.stem

        total = 0
        completed = 0
        failed = 0
        in_progress = 0

        with open(progress_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    record = json.loads(line)
                    total += 1
                    if record["status"] == "completed":
                        completed += 1
                    elif record["status"] == "failed":
                        failed += 1
                    elif record["status"] == "in_progress":
                        in_progress += 1

        percent = completed / total * 100 if total > 0 else 0
        status_icon = "✅" if completed == total else "⏳"

        print(
            f"{status_icon} {stage:25s}: {completed:4d}/{total:4d} ({percent:5.1f}%)",
            end="",
        )
        if failed > 0:
            print(f" [❌ Failed: {failed}]", end="")
        if in_progress > 0:
            print(f" [🔄 In Progress: {in_progress}]", end="")
        print()

        total_all += total
        completed_all += completed

    print("=" * 80)
    overall_percent = completed_all / total_all * 100 if total_all > 0 else 0
    print(f"全体進捗: {completed_all}/{total_all} ({overall_percent:.1f}%)")
    print("=" * 80 + "\n")


def show_details(stage: str, language: Optional[str] = None):
    """特定ステージの詳細を表示"""
    progress = load_progress(stage, language)

    if not progress:
        print(f"❌ 進捗ファイルが存在しません: {stage}")
        return

    # ステータス別集計
    pending = [r for r in progress.values() if r["status"] == "pending"]
    in_progress = [r for r in progress.values() if r["status"] == "in_progress"]
    completed = [r for r in progress.values() if r["status"] == "completed"]
    failed = [r for r in progress.values() if r["status"] == "failed"]

    stage_name = f"{stage}-{language}" if language else stage

    print(f"\n{'=' * 80}")
    print(f"{stage_name} 詳細")
    print("=" * 80)
    print(f"総単語数: {len(progress)}")
    print(f"✅ 完了: {len(completed)} ({len(completed) / len(progress) * 100:.1f}%)")
    print(f"🔄 処理中: {len(in_progress)}")
    print(f"⏳ 未処理: {len(pending)}")
    print(f"❌ 失敗: {len(failed)}")

    if in_progress:
        print(f"\n処理中の単語:")
        for r in in_progress[:5]:
            print(f"  - {r['en']} (since {r.get('timestamp', 'unknown')})")

    if failed:
        print(f"\n失敗した単語:")
        for r in failed[:10]:
            error_msg = r.get("error", "Unknown error")
            print(f"  - {r['en']}: {error_msg}")

    if pending and len(pending) <= 20:
        print(f"\n未処理の単語:")
        for r in pending:
            print(f"  - {r['en']}")
    elif pending:
        print(f"\n未処理の単語（最初の20件）:")
        for r in list(pending)[:20]:
            print(f"  - {r['en']}")
        print(f"  ... 他 {len(pending) - 20}語")

    print("=" * 80 + "\n")


def reset_word(stage: str, word: str, language: Optional[str] = None):
    """特定の単語をリセット"""
    progress = load_progress(stage, language)

    if word not in progress:
        print(f"❌ 単語が見つかりません: {word}")
        return

    progress[word] = {"en": word, "status": "pending"}

    save_progress(stage, progress, language)

    stage_name = f"{stage}-{language}" if language else stage
    print(f"✅ リセット完了: {stage_name} / {word}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == "init":
        if len(sys.argv) < 3:
            print("使い方: progress_manager.py init <stage> [language]")
            sys.exit(1)
        stage = sys.argv[2]
        language = sys.argv[3] if len(sys.argv) > 3 else None
        init_progress(stage, language)

    elif command == "show":
        if len(sys.argv) == 2:
            show_summary()
        else:
            stage = sys.argv[2]
            language = sys.argv[3] if len(sys.argv) > 3 else None
            show_details(stage, language)

    elif command == "reset":
        if len(sys.argv) < 4:
            print("使い方: progress_manager.py reset <stage> <word> [language]")
            sys.exit(1)
        stage = sys.argv[2]
        word = sys.argv[3]
        language = sys.argv[4] if len(sys.argv) > 4 else None
        reset_word(stage, word, language)

    else:
        print(f"❌ 不明なコマンド: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
