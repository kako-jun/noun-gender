#!/usr/bin/env python3
"""
全CSV → データベース一括同期スクリプト

使用法:
    python scripts/sync_all.py
    
機能:
    - 3つのCSVファイルを順次データベースに同期
    - エラーがある場合は処理を停止
"""

import subprocess
import sys
from pathlib import Path

def run_script(script_name):
    """単一スクリプトを実行し、結果を返す"""
    script_path = Path(__file__).parent / script_name
    
    print(f"\n{'='*50}")
    print(f"実行中: {script_name}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run([sys.executable, str(script_path)], 
                              capture_output=False, 
                              check=True)
        print(f"✅ {script_name} 完了")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {script_name} 失敗 (終了コード: {e.returncode})")
        return False
    except Exception as e:
        print(f"❌ {script_name} エラー: {e}")
        return False

def sync_all():
    """全てのCSV同期スクリプトを実行"""
    scripts = [
        'sync_meaning_translations.py',
        'sync_examples.py', 
        'sync_gender_translations.py'
    ]
    
    print("CSV → データベース一括同期を開始します...")
    
    success_count = 0
    for script in scripts:
        if run_script(script):
            success_count += 1
        else:
            print(f"\n❌ エラーのため処理を中断します")
            break
    
    print(f"\n{'='*50}")
    print(f"同期結果: {success_count}/{len(scripts)} スクリプト成功")
    
    if success_count == len(scripts):
        print("✅ 全ての同期が完了しました")
        return True
    else:
        print("❌ 一部の同期が失敗しました")
        return False

if __name__ == '__main__':
    success = sync_all()
    sys.exit(0 if success else 1)