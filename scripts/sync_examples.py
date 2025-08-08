#!/usr/bin/env python3
"""
例文CSV → examples テーブル同期スクリプト

使用法:
    python scripts/sync_examples.py
    
機能:
    - word_examples.csv から examples テーブルを更新
    - INSERT OR REPLACE で重複自動解決
    - example_en が空でない行のみ処理
"""

import sqlite3
import csv
import sys
from pathlib import Path

def sync_examples():
    # ファイルパス
    db_path = Path(__file__).parent.parent / 'data/noun_gender.db'
    csv_path = Path(__file__).parent.parent / 'data/word_examples.csv'
    
    if not csv_path.exists():
        print(f"エラー: {csv_path} が見つかりません")
        return False
    
    if not db_path.exists():
        print(f"エラー: {db_path} が見つかりません")
        return False
    
    # データベース接続
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            header = next(reader)  # ヘッダースキップ
            print(f"列: {header}")
            
            for line_num, row in enumerate(reader, 2):  # 行番号は2から
                try:
                    if len(row) < 3:
                        print(f"警告: 行{line_num} - 列数不正 ({len(row)}列): {row[0] if row else '空行'}")
                        error_count += 1
                        continue
                    
                    en, meaning_en, example_en = row[0], row[1], row[2]
                    
                    # example_en が空でない場合のみ処理
                    if example_en.strip():
                        cursor.execute('''
                            INSERT OR REPLACE INTO examples (en, example_en)
                            VALUES (?, ?)
                        ''', (en, example_en))
                        updated_count += 1
                        if updated_count % 50 == 0:
                            print(f"進捗: {updated_count}件処理済み...")
                    else:
                        skipped_count += 1
                        
                except Exception as e:
                    print(f"エラー: 行{line_num} - {row[0] if row else '不明'}: {e}")
                    error_count += 1
        
        conn.commit()
        print(f"\n完了:")
        print(f"  更新: {updated_count}件")
        print(f"  スキップ: {skipped_count}件")
        print(f"  エラー: {error_count}件")
        
        return error_count == 0
        
    except Exception as e:
        print(f"致命的エラー: {e}")
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    success = sync_examples()
    sys.exit(0 if success else 1)