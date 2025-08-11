#!/usr/bin/env python3
"""
性別翻訳CSV → words_* テーブル同期スクリプト

使用法:
    python scripts/sync_gender_translations.py
    
機能:
    - word_gender_translations.csv から words_fr, words_de 等を更新
    - INSERT OR REPLACE で重複自動解決
    - 翻訳と性別が両方とも空でない行のみ処理
    - 8言語対応: fr, de, es, it, pt, ru, ar, hi
    - 性別マーカー検証: m, f, n のみ許可
"""

import sqlite3
import csv
import sys
from pathlib import Path

# 許可される性別マーカー
VALID_GENDER_MARKERS = {'m', 'f', 'n'}

def sync_gender_translations():
    # ファイルパス
    db_path = Path(__file__).parent.parent / 'data/noun_gender.db'
    csv_path = Path(__file__).parent.parent / 'data/word_gender_translations.csv'
    
    if not csv_path.exists():
        print(f"エラー: {csv_path} が見つかりません")
        return False
    
    if not db_path.exists():
        print(f"エラー: {db_path} が見つかりません")
        return False
    
    # 言語マッピング（列番号）
    languages = {
        'fr': 2,  # fr_translation, fr_gender
        'de': 4,  # de_translation, de_gender  
        'es': 6,  # es_translation, es_gender
        'it': 8,  # it_translation, it_gender
        'pt': 10, # pt_translation, pt_gender
        'ru': 12, # ru_translation, ru_gender
        'ar': 14, # ar_translation, ar_gender
        'hi': 16  # hi_translation, hi_gender
    }
    
    # データベース接続
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    updated_count = {}
    error_count = 0
    validation_errors = []
    
    for lang in languages.keys():
        updated_count[lang] = 0
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            header = next(reader)  # ヘッダースキップ
            print(f"列: {len(header)}列")
            
            for line_num, row in enumerate(reader, 2):  # 行番号は2から
                try:
                    if len(row) < 17:  # 最低限必要な列数
                        print(f"警告: 行{line_num} - 列数不正 ({len(row)}列): {row[0] if row else '空行'}")
                        error_count += 1
                        continue
                    
                    en = row[0]
                    
                    # 各言語の翻訳と性別をチェック・挿入
                    for lang_code, translation_col in languages.items():
                        translation = row[translation_col] if len(row) > translation_col else ''
                        gender = row[translation_col + 1] if len(row) > translation_col + 1 else ''
                        
                        # 翻訳と性別が両方とも空でない場合のみ処理
                        if translation.strip() and gender.strip():
                            # 性別マーカーのバリデーション
                            if gender.strip() not in VALID_GENDER_MARKERS:
                                error_msg = f"行{line_num} [{en}] {lang_code.upper()}: 不正な性別マーカー '{gender}' (有効: m, f, n)"
                                print(f"❌ エラー: {error_msg}")
                                validation_errors.append(error_msg)
                                error_count += 1
                                continue
                            
                            cursor.execute(f'''
                                INSERT OR REPLACE INTO words_{lang_code} 
                                (en, translation, gender, verified_at, confidence_score)
                                VALUES (?, ?, ?, datetime('now'), 100)
                            ''', (en, translation, gender))
                            updated_count[lang_code] += 1
                            
                except Exception as e:
                    print(f"エラー: 行{line_num} - {row[0] if row else '不明'}: {e}")
                    error_count += 1
        
        # エラーがなければコミット、あればロールバック
        if error_count == 0:
            conn.commit()
            print(f"\n✅ 同期完了:")
            for lang_code, count in updated_count.items():
                print(f"  {lang_code.upper()}: {count}件")
            print(f"  総計: {sum(updated_count.values())}件")
            print(f"  エラー: {error_count}件")
        else:
            conn.rollback()
            print(f"\n❌ 同期失敗: {error_count}件のエラーがあります")
            print(f"データベースへの変更はロールバックされました\n")
            
            # バリデーションエラーのサマリー表示
            if validation_errors:
                print("🔍 検出された性別マーカーエラー:")
                for error in validation_errors:
                    print(f"  • {error}")
                print(f"\n💡 修正方法:")
                print(f"  1. CSVファイルで不正な性別マーカーを m, f, n に修正")
                print(f"  2. 再度このスクリプトを実行")
        
        return error_count == 0
        
    except Exception as e:
        print(f"致命的エラー: {e}")
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    success = sync_gender_translations()
    sys.exit(0 if success else 1)