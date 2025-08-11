#!/usr/bin/env python3
"""
性別マーカーの外部キー制約をテストするスクリプト
"""

import sqlite3
import sys

def test_gender_constraints():
    """性別マーカーの制約をテスト"""
    
    db_path = 'data/noun_gender.db'
    
    try:
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()
        
        print("🧪 性別マーカー制約テスト開始...")
        
        # テスト用の英語単語を追加
        test_word = "test_constraint_validation"
        try:
            cursor.execute("INSERT OR REPLACE INTO words_en (en) VALUES (?)", (test_word,))
            print(f"✅ テスト用英語単語 '{test_word}' を追加")
        except sqlite3.Error as e:
            print(f"❌ テスト用英語単語追加エラー: {e}")
            return
        
        # 1. 正当な性別マーカー（m, f, n）のテスト
        valid_genders = ['m', 'f', 'n']
        
        for i, gender in enumerate(valid_genders):
            try:
                cursor.execute(
                    "INSERT OR REPLACE INTO words_fr (en, translation, gender) VALUES (?, ?, ?)",
                    (test_word, f"test_{gender}", gender)
                )
                print(f"✅ 正当な性別マーカー '{gender}' - 挿入成功")
            except sqlite3.Error as e:
                print(f"❌ 正当な性別マーカー '{gender}' - 挿入失敗: {e}")
        
        # 2. 不正な性別マーカーのテスト
        invalid_genders = ['mp', 'fp', 'np', 'a', 'x', 'invalid', '']
        
        for gender in invalid_genders:
            try:
                cursor.execute(
                    "INSERT INTO words_de (en, translation, gender) VALUES (?, ?, ?)",
                    (test_word, f"test_{gender}", gender)
                )
                print(f"❌ 不正な性別マーカー '{gender}' - 挿入されてしまった（制約が機能していない）")
            except sqlite3.Error as e:
                print(f"✅ 不正な性別マーカー '{gender}' - 正しく拒否: {e}")
        
        # 3. 現在のデータベースの性別マーカー統計
        print("\n📊 現在のDB内性別マーカー統計:")
        languages = ['fr', 'de', 'es', 'it', 'pt', 'ru', 'ar', 'hi']
        
        for lang in languages:
            cursor.execute(f"SELECT gender, COUNT(*) FROM words_{lang} GROUP BY gender ORDER BY COUNT(*) DESC")
            results = cursor.fetchall()
            if results:
                print(f"  {lang.upper()}: {', '.join([f'{g}({c})' for g, c in results])}")
        
        # 4. マスターテーブルの確認
        print("\n🎯 性別マーカーマスターテーブル:")
        cursor.execute("SELECT code, name_en, name_ja FROM gender_markers ORDER BY code")
        for code, name_en, name_ja in cursor.fetchall():
            print(f"  {code}: {name_en} ({name_ja})")
        
        # テストデータのクリーンアップ
        cursor.execute("DELETE FROM words_en WHERE en = ?", (test_word,))
        conn.commit()
        print(f"\n🧹 テストデータ '{test_word}' をクリーンアップ")
        
        print("\n🎉 性別マーカー制約テスト完了!")
        
    except sqlite3.Error as e:
        print(f"❌ データベースエラー: {e}")
        return False
    finally:
        if conn:
            conn.close()
    
    return True

if __name__ == "__main__":
    success = test_gender_constraints()
    sys.exit(0 if success else 1)