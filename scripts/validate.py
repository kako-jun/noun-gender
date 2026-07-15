#!/usr/bin/env python3
"""データ検証ゲート（唯一の検証スクリプト）

data/ の全CSV（タブ区切り）の構造・整合性を検査する。
コミット前に必ず実行する: uv run python3 scripts/validate.py

終了コード:
    0 = PASS（FAILなし。WARNは許容）
    1 = FAIL（構造的な問題あり）

FAIL（構造）:
    - \r（CR）の混入（全CSVはLF改行。テキストモードではCRLFが透過変換され
      見えないため生バイトで検査する）
    - 行数・enキー集合の不一致（words.csv vs 全10 translations ファイル）
    - en の重複
    - アルファベット順（大文字小文字無視）の乱れ
    - 列数の不一致
    - ja/zh に translation または gender が入っている
    - gender が不正値（m/f、de/ru のみ n と pl も許可）
    - example_translations.csv の (en, lang) 重複・欠落・余剰

WARN（品質・充填ギャップ）:
    - 未充填セル（充填率レポート）
    - meaning_en が20文字未満
    - meaning_en に見出し語そのものが含まれる（循環定義）
"""

import csv
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

GENDER_LANGS = ["fr", "de", "es", "it", "pt", "ru", "ar", "hi"]
DISPLAY_ONLY_LANGS = ["ja", "zh"]
ALL_LANGS = GENDER_LANGS + DISPLAY_ONLY_LANGS
NEUTER_LANGS = {"de", "ru"}  # n (中性) と pl (複数のみ名詞) を追加で許可


def sort_key(en: str) -> str:
    """英字・数字以外を無視した小文字キー（GNU sort の辞書順に合わせる）"""
    return re.sub(r"[^a-z0-9]", "", en.lower())

failures: list[str] = []
warnings: list[str] = []


def fail(msg: str) -> None:
    failures.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def check_line_endings() -> None:
    """data/ の全CSVが LF 改行・\r 混入なしであることをバイトレベルで検査

    テキストモード読みは CRLF を透過的に LF へ変換するため、
    csv パーサ経由では \r の混入を検出できない。ここで生バイトを見る。
    """
    for path in sorted(DATA_DIR.glob("*.csv")):
        n = path.read_bytes().count(b"\r")
        if n:
            fail(f"{path.name}: \\r を {n} 個含む（LF改行に正規化すること）")


def read_tsv(path: Path, expected_cols: list[str]) -> list[dict]:
    """タブ区切りCSVを読み、列数・ヘッダーを検査して行リストを返す"""
    rows = []
    with open(path, encoding="utf-8", newline="") as f:
        reader = csv.reader(f, delimiter="\t", quoting=csv.QUOTE_NONE)
        header = next(reader)
        if header != expected_cols:
            fail(f"{path.name}: ヘッダー不一致 {header} != {expected_cols}")
        n = len(expected_cols)
        for i, raw in enumerate(reader, start=2):
            if len(raw) != n:
                fail(f"{path.name}:{i}: 列数 {len(raw)} != {n}")
                raw = (raw + [""] * n)[:n]
            rows.append(dict(zip(expected_cols, raw)))
    return rows


def check_keys(name: str, ens: list[str], ref: set[str] | None) -> set[str]:
    """en重複・アルファベット順・基準集合との一致を検査"""
    seen = set()
    for en in ens:
        if en in seen:
            fail(f"{name}: en 重複 '{en}'")
        seen.add(en)
    keys = [sort_key(e) for e in ens]
    if keys != sorted(keys):
        for i in range(1, len(keys)):
            if keys[i - 1] > keys[i]:
                fail(f"{name}: アルファベット順の乱れ '{ens[i-1]}' > '{ens[i]}'")
                break
    if ref is not None and seen != ref:
        missing = sorted(ref - seen)[:5]
        extra = sorted(seen - ref)[:5]
        fail(
            f"{name}: en 集合が words.csv と不一致 "
            f"(欠落 {len(ref - seen)} 例 {missing} / 余剰 {len(seen - ref)} 例 {extra})"
        )
    return seen


def fill_rate(name: str, rows: list[dict], col: str) -> None:
    filled = sum(1 for r in rows if r[col].strip())
    total = len(rows)
    mark = "" if filled == total else "  <- 未充填あり"
    print(f"  {name}.{col}: {filled}/{total} ({filled / total * 100:.1f}%){mark}")
    if filled < total:
        warn(f"{name}.{col}: 未充填 {total - filled} 件")


def main() -> int:
    print("=" * 60)
    print("noun-gender データ検証")
    print("=" * 60)

    # 改行コード（生バイト検査）
    check_line_endings()

    # words.csv
    words = read_tsv(DATA_DIR / "words.csv", ["en", "meaning_en", "example_en"])
    en_list = [r["en"] for r in words]
    en_set = check_keys("words.csv", en_list, None)
    print(f"\nwords.csv: {len(words)} 行")

    # translations_{lang}.csv
    trans: dict[str, list[dict]] = {}
    for lang in ALL_LANGS:
        name = f"translations_{lang}.csv"
        rows = read_tsv(DATA_DIR / name, ["en", "translation", "gender", "meaning_translation"])
        trans[lang] = rows
        if len(rows) != len(words):
            fail(f"{name}: 行数 {len(rows)} != words.csv {len(words)}")
        check_keys(name, [r["en"] for r in rows], en_set)

        if lang in DISPLAY_ONLY_LANGS:
            bad = [r["en"] for r in rows if r["translation"].strip() or r["gender"].strip()]
            if bad:
                fail(f"{name}: 表示専用言語なのに translation/gender が非空 "
                     f"{len(bad)} 件 例 {bad[:5]}")
        else:
            allowed = {"m", "f"} | ({"n", "pl"} if lang in NEUTER_LANGS else set())
            bad = [(r["en"], r["gender"]) for r in rows
                   if r["gender"].strip() and r["gender"].strip() not in allowed]
            if bad:
                fail(f"{name}: 不正 gender {len(bad)} 件 例 {bad[:5]} (許容 {sorted(allowed)})")

    # example_translations.csv
    ex_rows = read_tsv(DATA_DIR / "example_translations.csv", ["en", "lang", "example_translation"])
    pairs = set()
    for r in ex_rows:
        key = (r["en"], r["lang"])
        if key in pairs:
            fail(f"example_translations.csv: (en, lang) 重複 {key}")
        pairs.add(key)
        if r["lang"] not in ALL_LANGS:
            fail(f"example_translations.csv: 不明な lang '{r['lang']}' (en={r['en']})")
    expected_pairs = {(en, lang) for en in en_set for lang in ALL_LANGS}
    missing = expected_pairs - pairs
    extra = pairs - expected_pairs
    if missing:
        fail(f"example_translations.csv: 欠落ペア {len(missing)} 件 例 {sorted(missing)[:5]}")
    if extra:
        fail(f"example_translations.csv: 余剰ペア {len(extra)} 件 例 {sorted(extra)[:5]}")
    print(f"example_translations.csv: {len(ex_rows)} 行 (期待 {len(en_set) * len(ALL_LANGS)})")

    # 充填率レポート
    print("\n--- 充填率 ---")
    fill_rate("words.csv", words, "meaning_en")
    fill_rate("words.csv", words, "example_en")
    for lang in GENDER_LANGS:
        fill_rate(f"translations_{lang}.csv", trans[lang], "translation")
        fill_rate(f"translations_{lang}.csv", trans[lang], "gender")
        fill_rate(f"translations_{lang}.csv", trans[lang], "meaning_translation")
    for lang in DISPLAY_ONLY_LANGS:
        fill_rate(f"translations_{lang}.csv", trans[lang], "meaning_translation")
    fill_rate("example_translations.csv", ex_rows, "example_translation")

    # 品質チェック（WARN）
    short = [r["en"] for r in words if r["meaning_en"].strip() and len(r["meaning_en"].strip()) < 20]
    if short:
        warn(f"meaning_en 20文字未満 {len(short)} 件 例 {short[:10]}")
    circular = [
        r["en"] for r in words
        if re.search(rf"\b{re.escape(r['en'])}\b", r["meaning_en"], re.IGNORECASE)
    ]
    if circular:
        warn(f"meaning_en に見出し語を含む（循環定義の疑い） {len(circular)} 件 例 {circular[:10]}")

    # レポート
    print("\n" + "=" * 60)
    if warnings:
        print(f"WARN: {len(warnings)} 件")
        for w in warnings:
            print(f"  [WARN] {w}")
    if failures:
        print(f"FAIL: {len(failures)} 件")
        for f_ in failures:
            print(f"  [FAIL] {f_}")
        print("\n結果: FAIL")
        return 1
    print("\n結果: PASS" + ("（WARNあり）" if warnings else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
