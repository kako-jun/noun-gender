#!/usr/bin/env python3
"""
CSV → Database 同期スクリプト

example_translations.csv の内容をデータベースの example_translations テーブルに反映します。
べき等性を保証し、何度実行しても安全です。
"""

import csv
import sqlite3
import sys
import os

def sync_example_translations():
    """example_translations.csv → database 同期"""
    
    # ファイルパスの確認
    csv_path = 'data/example_translations.csv'
    db_path = 'data/noun_gender.db'
    
    if not os.path.exists(csv_path):
        print(f"エラー: {csv_path} が見つかりません")
        return False
    
    if not os.path.exists(db_path):
        print(f"エラー: {db_path} が見つかりません")
        return False
    
    print("=== CSV → Database 同期開始 ===")
    
    # データベース接続
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 現在のDBレコード数を取得
    cursor.execute("SELECT COUNT(*) FROM example_translations")
    initial_count = cursor.fetchone()[0]
    print(f"同期前のDBレコード数: {initial_count}")
    
    # CSVファイルを読み込み
    updated_count = 0
    inserted_count = 0
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter='\t')
        
        for row_num, row in enumerate(reader, 1):
            example_en = row['example_en']
            lang = row['lang']
            translation = row['translation']
            
            if not example_en or not lang:
                continue
            
            # 既存レコードがあるかチェック
            cursor.execute('''
                SELECT id, translation FROM example_translations 
                WHERE example_en = ? AND lang = ?
            ''', (example_en, lang))
            
            existing = cursor.fetchone()
            
            if existing:
                # 既存レコードがあり、翻訳が異なる場合は更新
                existing_id, existing_translation = existing
                if existing_translation != translation:
                    cursor.execute('''
                        UPDATE example_translations 
                        SET translation = ? 
                        WHERE id = ?
                    ''', (translation, existing_id))
                    updated_count += 1
            else:
                # 新規レコードを挿入
                cursor.execute('''
                    INSERT INTO example_translations (example_en, lang, translation)
                    VALUES (?, ?, ?)
                ''', (example_en, lang, translation))
                inserted_count += 1
            
            # 進捗表示（1000行ごと）
            if row_num % 1000 == 0:
                print(f"処理中... {row_num}行")
    
    # 変更をコミット
    conn.commit()
    
    # 最終レコード数を取得
    cursor.execute("SELECT COUNT(*) FROM example_translations")
    final_count = cursor.fetchone()[0]
    
    conn.close()
    
    print(f"=== 同期完了 ===")
    print(f"更新されたレコード: {updated_count}")
    print(f"新規挿入されたレコード: {inserted_count}")
    print(f"同期後のDBレコード数: {final_count}")
    print(f"レコード増加数: {final_count - initial_count}")
    
    return True

def verify_sync():
    """同期結果の検証"""
    print("\n=== 同期結果の検証 ===")
    
    # CSV行数をカウント
    csv_lines = 0
    with open('data/example_translations.csv', 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter='\t')
        csv_lines = sum(1 for row in reader)
    
    # DB行数をカウント
    conn = sqlite3.connect('data/noun_gender.db')
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM example_translations")
    db_lines = cursor.fetchone()[0]
    conn.close()
    
    print(f"CSV行数: {csv_lines}")
    print(f"DB行数: {db_lines}")
    
    if csv_lines == db_lines:
        print("✅ CSV と Database の行数が一致しています")
    else:
        print("⚠️  CSV と Database の行数が一致しません")
    
    return csv_lines == db_lines

if __name__ == '__main__':
    print("example_translations.csv → Database 同期スクリプト")
    print("=" * 50)
    
    if sync_example_translations():
        verify_sync()
    else:
        print("同期に失敗しました")
        sys.exit(1)