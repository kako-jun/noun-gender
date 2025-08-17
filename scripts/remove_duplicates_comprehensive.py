#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
意味翻訳CSVファイルの同一言語内重複削除スクリプト
セミコロン区切りの翻訳内で、同一言語内の重複を削除する
"""

import csv
import sys
from typing import List

def remove_duplicates_in_field(field_value: str) -> str:
    """
    セミコロン区切りフィールド内の重複を削除
    大文字小文字の区別なし、左を優先して右を削除
    """
    if not field_value or ';' not in field_value:
        return field_value
    
    parts = field_value.split(';')
    seen_lower = []  # 小文字版で重複チェック
    result = []      # 元の形式を保持
    
    for part in parts:
        cleaned = part.strip()
        if not cleaned:
            continue
            
        cleaned_lower = cleaned.lower()
        
        # 大文字小文字を区別せずに重複チェック
        if cleaned_lower not in seen_lower:
            seen_lower.append(cleaned_lower)
            result.append(part)  # 元の形式（大文字小文字・スペース）を保持
    
    return ';'.join(result)

def process_csv_file(input_file: str, output_file: str):
    """CSVファイルを処理して重複を削除"""
    
    duplicates_found = 0
    rows_processed = 0
    
    with open(input_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        
        reader = csv.reader(infile, delimiter='\t')
        writer = csv.writer(outfile, delimiter='\t')
        
        for row_num, row in enumerate(reader, 1):
            if len(row) < 12:  # 12列未満はスキップ
                writer.writerow(row)
                continue
                
            original_row = row.copy()
            rows_processed += 1
            
            # 列2-11（meaning_ja から meaning_hi）を処理
            for col_idx in range(2, 12):
                if col_idx < len(row):
                    original_value = row[col_idx]
                    cleaned_value = remove_duplicates_in_field(original_value)
                    
                    if original_value != cleaned_value:
                        duplicates_found += 1
                        print(f"行{row_num}: {row[0]} - 列{col_idx+1}で重複削除")
                        print(f"  修正前: {original_value}")
                        print(f"  修正後: {cleaned_value}")
                        print()
                    
                    row[col_idx] = cleaned_value
            
            writer.writerow(row)
    
    print(f"\n=== 処理完了 ===")
    print(f"処理行数: {rows_processed}")
    print(f"重複発見・修正: {duplicates_found} 箇所")
    print(f"出力ファイル: {output_file}")

if __name__ == "__main__":
    input_file = "/home/kako-jun/repos/2025/noun-gender/data/word_meaning_translations.csv"
    output_file = "/home/kako-jun/repos/2025/noun-gender/data/word_meaning_translations_fixed.csv"
    
    print("=== 同一言語内重複削除スクリプト実行開始 ===")
    print(f"入力ファイル: {input_file}")
    print(f"出力ファイル: {output_file}")
    print()
    
    process_csv_file(input_file, output_file)