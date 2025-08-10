#!/usr/bin/env python3
"""
CSVファイルから削除対象単語の行を削除するスクリプト
"""

import csv
import os
from pathlib import Path

# 削除対象単語リスト
DELETE_WORDS = [
    'active', 'altogether', 'delicious', 'easy', 'when', 'where'
]

def delete_words_from_csv(csv_file_path):
    """指定されたCSVファイルから削除対象単語の行を削除"""
    if not os.path.exists(csv_file_path):
        print(f"ファイルが存在しません: {csv_file_path}")
        return
    
    print(f"処理中: {csv_file_path}")
    
    # 元ファイルを読み取り
    rows_to_keep = []
    deleted_count = 0
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter='\t')
        header = next(reader)  # ヘッダー行を保存
        rows_to_keep.append(header)
        
        for row in reader:
            if row and row[0] not in DELETE_WORDS:
                rows_to_keep.append(row)
            else:
                deleted_count += 1
                print(f"  削除: {row[0] if row else 'empty row'}")
    
    # ファイルを書き戻し
    with open(csv_file_path, 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file, delimiter='\t')
        writer.writerows(rows_to_keep)
    
    print(f"  削除完了: {deleted_count}行削除, 残り{len(rows_to_keep)-1}行")
    return deleted_count

def main():
    """メイン処理"""
    project_root = Path(__file__).parent.parent
    data_dir = project_root / 'data'
    
    csv_files = [
        'word_meaning_translations.csv',
        'word_examples.csv', 
        'word_gender_translations.csv'
    ]
    
    total_deleted = 0
    
    for csv_file in csv_files:
        csv_path = data_dir / csv_file
        deleted = delete_words_from_csv(csv_path)
        if deleted:
            total_deleted += deleted
        print()
    
    print(f"全体削除完了: {total_deleted}行削除")
    print(f"削除対象語数: {len(DELETE_WORDS)}語")

if __name__ == '__main__':
    main()