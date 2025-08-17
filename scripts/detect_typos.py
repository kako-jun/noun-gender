#!/usr/bin/env python3
"""
体系的誤字検出スクリプト
CSVファイル内の日本語翻訳における潜在的な誤字を検出する
"""

import csv
import re
from typing import Dict, List, Tuple, Set

def detect_suspicious_characters(text: str) -> List[Tuple[str, int, str]]:
    """疑わしい文字を検出"""
    suspicious = []
    
    for char in text:
        code = ord(char)
        
        # 1. 明らかに間違った文字（既知のパターン）
        known_typos = {
            0x4ed2: ('仒', '仲の誤字'),
            0x4eda: ('仚', '仲の誤字'),
            0x4ed1: ('仑', '会の誤字'),
            0x4ed3: ('仓', '倉の誤字'),
        }
        
        if code in known_typos:
            char_info, desc = known_typos[code]
            suspicious.append((char, code, f"既知誤字: {desc}"))
            continue
            
        # 2. 常用漢字範囲内だが疑わしい範囲
        if 0x4e00 <= code <= 0x9fff:  # CJK統合漢字
            # 特に誤字が多発する危険ゾーン
            if (0x4ed0 <= code <= 0x4edf and code not in [0x4ed4, 0x4ed5, 0x4ed6, 0x4ed7, 0x4ed8, 0x4ed9]):  # 仐-仟（仔仕他付仙は除外）
                suspicious.append((char, code, "危険ゾーン1: 仐-仟"))
            elif (0x4fe0 <= code <= 0x4fe9 and code not in [0x4fe1]):  # 俠-俩（信は除外）  
                suspicious.append((char, code, "危険ゾーン2: 俠-俩"))
            elif (0x5000 <= code <= 0x500f and code not in [0x5009, 0x500b, 0x500d]):  # 倀-倏（倉個倍は除外）
                suspicious.append((char, code, "危険ゾーン3: 倀-倏"))
                
    return suspicious

def detect_pattern_anomalies(text: str) -> List[str]:
    """パターン異常を検出"""
    anomalies = []
    
    # 1. 重複する単語（例: 仲間; 仲間）
    words = [w.strip() for w in text.split(';')]
    if len(words) != len(set(words)):
        duplicates = [w for w in set(words) if words.count(w) > 1]
        anomalies.append(f"重複語: {', '.join(duplicates)}")
    
    # 2. 異常な文字組み合わせ
    strange_patterns = [
        r'仒',  # 仲の誤字
        r'仚',  # 仲の誤字  
        r'测',  # 測の簡体字が混入
        r'运',  # 運の簡体字が混入
        r'记',  # 記の簡体字が混入
    ]
    
    for pattern in strange_patterns:
        if re.search(pattern, text):
            anomalies.append(f"異常パターン: {pattern}")
            
    return anomalies

def detect_encoding_issues(text: str) -> List[str]:
    """エンコーディング問題を検出"""
    issues = []
    
    # 文字化けパターン
    mojibake_patterns = [
        r'[ï¿½]',  # UTF-8 replacement character
        r'[â€]',   # UTF-8 encoding issues
        r'[Ã]',    # Latin-1/UTF-8 混在
    ]
    
    for pattern in mojibake_patterns:
        if re.search(pattern, text):
            issues.append(f"文字化け疑い: {pattern}")
            
    return issues

def analyze_csv_file(filename: str, japanese_column: int) -> Dict:
    """CSVファイルを分析"""
    results = {
        'suspicious_chars': [],
        'pattern_anomalies': [],
        'encoding_issues': [],
        'total_rows': 0,
        'problematic_rows': 0
    }
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            next(reader)  # ヘッダーをスキップ
            
            for row_num, row in enumerate(reader, 2):  # 2行目から開始
                results['total_rows'] += 1
                
                if len(row) <= japanese_column:
                    continue
                    
                japanese_text = row[japanese_column]
                en_word = row[0] if len(row) > 0 else 'unknown'
                
                row_issues = []
                
                # 疑わしい文字検出
                suspicious = detect_suspicious_characters(japanese_text)
                if suspicious:
                    row_issues.extend(suspicious)
                    results['suspicious_chars'].append({
                        'row': row_num,
                        'word': en_word,
                        'text': japanese_text,
                        'issues': suspicious
                    })
                
                # パターン異常検出
                pattern_issues = detect_pattern_anomalies(japanese_text)
                if pattern_issues:
                    row_issues.extend(pattern_issues)
                    results['pattern_anomalies'].append({
                        'row': row_num,
                        'word': en_word,
                        'text': japanese_text,
                        'issues': pattern_issues
                    })
                
                # エンコーディング問題検出
                encoding_issues = detect_encoding_issues(japanese_text)
                if encoding_issues:
                    row_issues.extend(encoding_issues)
                    results['encoding_issues'].append({
                        'row': row_num,
                        'word': en_word,
                        'text': japanese_text,
                        'issues': encoding_issues
                    })
                
                if row_issues:
                    results['problematic_rows'] += 1
                    
    except Exception as e:
        print(f"エラー: {filename} の処理中にエラーが発生: {e}")
        
    return results

def main():
    """メイン処理"""
    csv_files = [
        ('data/word_meaning_translations.csv', 2),  # 日本語意味列
        ('data/word_examples.csv', 2),               # 例文は英語のみなのでスキップ
        ('data/word_gender_translations.csv', 1),   # 意味列
    ]
    
    print("=== CSV誤字検出スクリプト ===\n")
    
    total_issues = 0
    
    for filename, japanese_col in csv_files:
        if 'examples' in filename:  # 例文ファイルは英語のみなのでスキップ
            continue
            
        print(f"📁 分析中: {filename}")
        print("-" * 50)
        
        results = analyze_csv_file(filename, japanese_col)
        
        print(f"総行数: {results['total_rows']}")
        print(f"問題のある行: {results['problematic_rows']}")
        print()
        
        # 疑わしい文字の報告
        if results['suspicious_chars']:
            print("🚨 疑わしい文字:")
            for item in results['suspicious_chars']:
                print(f"  行{item['row']}: {item['word']} -> {item['text']}")
                for char, code, desc in item['issues']:
                    print(f"    └─ '{char}' (U+{code:04X}): {desc}")
            print()
            total_issues += len(results['suspicious_chars'])
        
        # パターン異常の報告
        if results['pattern_anomalies']:
            print("⚠️  パターン異常:")
            for item in results['pattern_anomalies']:
                print(f"  行{item['row']}: {item['word']} -> {item['text']}")
                for issue in item['issues']:
                    print(f"    └─ {issue}")
            print()
            total_issues += len(results['pattern_anomalies'])
        
        # エンコーディング問題の報告
        if results['encoding_issues']:
            print("💥 エンコーディング問題:")
            for item in results['encoding_issues']:
                print(f"  行{item['row']}: {item['word']} -> {item['text']}")
                for issue in item['issues']:
                    print(f"    └─ {issue}")
            print()
            total_issues += len(results['encoding_issues'])
        
        if not any([results['suspicious_chars'], results['pattern_anomalies'], results['encoding_issues']]):
            print("✅ 問題は検出されませんでした")
            print()
    
    print("=" * 50)
    print(f"🔍 検出結果: 合計 {total_issues} 件の問題")
    
    if total_issues > 0:
        print("\n📋 推奨アクション:")
        print("1. 上記の問題箇所をCSVファイルで手動修正")
        print("2. python scripts/sync_meaning_translations.py で同期")
        print("3. 修正後、再度このスクリプトを実行して確認")

if __name__ == "__main__":
    main()