#!/usr/bin/env python3
"""
記憶術CSVからデータベースへの正式同期スクリプト
CSV管理手順書に準拠した実装
"""
import sqlite3
import csv
import sys

def sync_memory_tricks_from_csv(csv_file_path, target_word=None):
    """
    memory_tricks_creation.csvからmemory_tricksテーブルに同期
    
    Args:
        csv_file_path: CSVファイルパス
        target_word: 特定単語のみ同期する場合（None=全同期）
    """
    conn = sqlite3.connect('data/noun_gender.db')
    cursor = conn.cursor()
    
    synced_count = 0
    error_count = 0
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            next(reader)  # ヘッダースキップ
            
            for row_num, row in enumerate(reader, start=2):
                if len(row) < 9:
                    print(f"Warning: Row {row_num} has insufficient columns, skipping")
                    continue
                
                en = row[0]
                target_lang = row[2] 
                ui_lang = row[5]
                trick_text_en = row[6]
                trick_text_translated = row[7]
                status = row[8]
                
                # 特定単語フィルタ
                if target_word and en != target_word:
                    continue
                
                # 完成済み記憶術のみ同期（ready または draft）
                if status not in ['ready', 'draft']:
                    continue
                
                # 記憶術テキスト決定（翻訳優先、なければ英語）
                trick_text = trick_text_translated if trick_text_translated else trick_text_en
                
                if not trick_text.strip():
                    continue
                
                try:
                    cursor.execute('''
                        INSERT OR REPLACE INTO memory_tricks 
                        (en, translation_lang, ui_lang, trick_text)
                        VALUES (?, ?, ?, ?)
                    ''', (en, target_lang, ui_lang, trick_text))
                    synced_count += 1
                    
                except sqlite3.Error as e:
                    print(f"Error syncing row {row_num}: {e}")
                    error_count += 1
        
        conn.commit()
        
        # 結果レポート
        if target_word:
            cursor.execute('SELECT COUNT(*) FROM memory_tricks WHERE en = ?', (target_word,))
            db_count = cursor.fetchone()[0]
            print(f"✅ {target_word} sync completed:")
            print(f"   Synced: {synced_count} records")
            print(f"   Database total: {db_count} records")
            print(f"   Errors: {error_count}")
        else:
            cursor.execute('SELECT COUNT(*) FROM memory_tricks')
            total_count = cursor.fetchone()[0]
            print(f"✅ Full sync completed:")
            print(f"   Synced: {synced_count} records")
            print(f"   Total in DB: {total_count} records")
            print(f"   Errors: {error_count}")
            
    except Exception as e:
        print(f"❌ Sync failed: {e}")
        return False
    finally:
        conn.close()
    
    return True

if __name__ == "__main__":
    # abbeyのみ同期
    csv_path = 'data/memory_tricks_creation.csv'
    success = sync_memory_tricks_from_csv(csv_path, target_word='abbey')
    
    if success:
        print("\n🎯 Abbey memory tricks successfully synced to database!")
    else:
        print("\n❌ Sync failed")
        sys.exit(1)