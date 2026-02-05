# 進捗管理システム設計

**最終更新**: 2025-02-05

---

## 📊 進捗管理の目的

1. **セッション跨ぎ対応**: 中断→再開が可能
2. **行単位管理**: どの単語まで完了したか明確
3. **品質管理**: 生成済み vs 未生成が明確
4. **並列処理対応**: 16サブエージェントが衝突しない

---

## 🏗️ システム構造

### ディレクトリ構成
```
.claude/workflow/
├── progress/
│   ├── stage1.jsonl               # Stage 1進捗（全4,592行）
│   ├── stage2.jsonl               # Stage 2進捗
│   ├── stage3-fr.jsonl            # Stage 3フランス語
│   ├── stage3-de.jsonl            # Stage 3ドイツ語
│   └── ...（各ステージ・各言語）
├── checkpoints/
│   ├── stage1-checkpoint.txt      # 最終完了行番号
│   ├── stage2-checkpoint.txt
│   └── ...
└── summary.json                   # 全体進捗サマリー
```

---

## 📝 進捗ファイル形式

### JSONL形式（1行1単語）

**stage1.jsonl**:
```jsonl
{"en":"abbey","status":"completed","timestamp":"2025-02-05T10:23:45Z","meaning_en_length":78}
{"en":"abbreviation","status":"completed","timestamp":"2025-02-05T10:23:46Z","meaning_en_length":42}
{"en":"ability","status":"in_progress","timestamp":"2025-02-05T10:23:47Z"}
{"en":"abnormality","status":"pending"}
```

**フィールド定義**:
- `en`: 英単語（主キー）
- `status`: `pending` | `in_progress` | `completed` | `failed`
- `timestamp`: ISO 8601形式
- `{column}_length`: 生成されたデータの長さ（品質チェック用）

---

## 🔄 ワークフロー

### Stage 1実行時の流れ

#### 1. 開始前：進捗ファイル初期化
```python
import json
import csv
from pathlib import Path

# CSVから単語リストを読み込み
with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    words = [row['en'] for row in reader]

# 進捗ファイル初期化（既存ファイルがない場合のみ）
progress_file = Path('.claude/workflow/progress/stage1.jsonl')
progress_file.parent.mkdir(parents=True, exist_ok=True)

if not progress_file.exists():
    with open(progress_file, 'w', encoding='utf-8') as f:
        for word in words:
            f.write(json.dumps({"en": word, "status": "pending"}) + '\n')
    print(f"✅ 進捗ファイル初期化: {len(words)}語")
else:
    print(f"⚠️ 進捗ファイル既存: {progress_file}")
```

#### 2. 実行中：進捗の読み込み
```python
import json

# 進捗を読み込み
progress = {}
with open('.claude/workflow/progress/stage1.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        record = json.loads(line)
        progress[record['en']] = record

# 未完了の単語だけ処理
pending_words = [word for word, rec in progress.items() if rec['status'] != 'completed']

print(f"総単語数: {len(progress)}")
print(f"完了: {len([r for r in progress.values() if r['status'] == 'completed'])}")
print(f"未完了: {len(pending_words)}")
print(f"進捗率: {len([r for r in progress.values() if r['status'] == 'completed']) / len(progress) * 100:.1f}%")
```

#### 3. 実行中：1単語ずつ更新
```python
import json
import csv
from datetime import datetime, timezone

# CSVを読み込み
with open('data/word_gender_translations.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    fieldnames = reader.fieldnames
    rows = list(reader)

# 進捗を読み込み
progress = {}
with open('.claude/workflow/progress/stage1.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        record = json.loads(line)
        progress[record['en']] = record

# 処理開始
for i, row in enumerate(rows, start=1):
    en = row['en']
    
    # 既に完了している場合はスキップ
    if progress[en]['status'] == 'completed':
        continue
    
    # ステータス更新: in_progress
    progress[en]['status'] = 'in_progress'
    progress[en]['timestamp'] = datetime.now(timezone.utc).isoformat()
    save_progress('.claude/workflow/progress/stage1.jsonl', progress)
    
    try:
        # meaning_en を生成
        meaning_en = generate_meaning(en)
        row['meaning_en'] = meaning_en
        
        # ステータス更新: completed
        progress[en]['status'] = 'completed'
        progress[en]['meaning_en_length'] = len(meaning_en)
        progress[en]['timestamp'] = datetime.now(timezone.utc).isoformat()
        save_progress('.claude/workflow/progress/stage1.jsonl', progress)
        
        # チェックポイント更新（100行ごと）
        if i % 100 == 0:
            save_checkpoint('stage1', i)
            save_csv(rows, fieldnames)
            print(f"✅ チェックポイント: {i}/{len(rows)}")
    
    except Exception as e:
        # エラー時
        progress[en]['status'] = 'failed'
        progress[en]['error'] = str(e)
        progress[en]['timestamp'] = datetime.now(timezone.utc).isoformat()
        save_progress('.claude/workflow/progress/stage1.jsonl', progress)
        print(f"❌ エラー: {en} - {e}")

# 最終保存
save_csv(rows, fieldnames)
save_checkpoint('stage1', len(rows))
print(f"✅ Stage 1完了: {len(rows)}語")
```

#### ヘルパー関数
```python
import json

def save_progress(filepath, progress):
    """進捗をJSONLファイルに保存"""
    with open(filepath, 'w', encoding='utf-8') as f:
        for record in progress.values():
            f.write(json.dumps(record, ensure_ascii=False) + '\n')

def save_checkpoint(stage, row_number):
    """チェックポイントを保存"""
    checkpoint_file = f'.claude/workflow/checkpoints/{stage}-checkpoint.txt'
    Path(checkpoint_file).parent.mkdir(parents=True, exist_ok=True)
    with open(checkpoint_file, 'w') as f:
        f.write(str(row_number))

def load_checkpoint(stage):
    """チェックポイントを読み込み"""
    checkpoint_file = f'.claude/workflow/checkpoints/{stage}-checkpoint.txt'
    if Path(checkpoint_file).exists():
        with open(checkpoint_file, 'r') as f:
            return int(f.read().strip())
    return 0

def save_csv(rows, fieldnames):
    """CSVを保存"""
    with open('data/word_gender_translations.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t')
        writer.writeheader()
        writer.writerows(rows)
```

---

## 📊 進捗確認コマンド

### 全体進捗を確認
```python
import json
from pathlib import Path

def show_progress_summary():
    """全ステージの進捗を表示"""
    progress_dir = Path('.claude/workflow/progress')
    
    for progress_file in sorted(progress_dir.glob('*.jsonl')):
        stage = progress_file.stem
        
        total = 0
        completed = 0
        failed = 0
        
        with open(progress_file, 'r', encoding='utf-8') as f:
            for line in f:
                record = json.loads(line)
                total += 1
                if record['status'] == 'completed':
                    completed += 1
                elif record['status'] == 'failed':
                    failed += 1
        
        percent = completed / total * 100 if total > 0 else 0
        print(f"{stage:20s}: {completed:4d}/{total:4d} ({percent:5.1f}%) [Failed: {failed}]")

# 実行
show_progress_summary()
```

### 特定ステージの詳細確認
```python
def show_stage_details(stage):
    """特定ステージの詳細を表示"""
    progress_file = f'.claude/workflow/progress/{stage}.jsonl'
    
    with open(progress_file, 'r', encoding='utf-8') as f:
        records = [json.loads(line) for line in f]
    
    # ステータス別集計
    pending = [r for r in records if r['status'] == 'pending']
    in_progress = [r for r in records if r['status'] == 'in_progress']
    completed = [r for r in records if r['status'] == 'completed']
    failed = [r for r in records if r['status'] == 'failed']
    
    print(f"\n=== {stage} 詳細 ===")
    print(f"総単語数: {len(records)}")
    print(f"完了: {len(completed)}")
    print(f"処理中: {len(in_progress)}")
    print(f"未処理: {len(pending)}")
    print(f"失敗: {len(failed)}")
    
    if failed:
        print("\n失敗した単語:")
        for r in failed[:10]:
            print(f"  - {r['en']}: {r.get('error', 'Unknown error')}")

# 実行
show_stage_details('stage1')
```

---

## 🔧 セッション再開時の手順

### 1. 進捗確認
```bash
python scripts/show_progress.py
```

### 2. 未完了単語から再開
```python
# 進捗を読み込み
progress = load_progress('stage1')

# 未完了の単語を取得
pending = [word for word, rec in progress.items() if rec['status'] != 'completed']

print(f"再開: {len(pending)}語が未完了")

# 未完了分を処理
for word in pending:
    # ... 処理継続
```

---

## 🎯 並列処理時の衝突回避

Stage 3では8言語を並列処理するため、**言語ごとに進捗ファイル分離**：

```
.claude/workflow/progress/
├── stage3-fr.jsonl   # フランス語専用
├── stage3-de.jsonl   # ドイツ語専用
└── ...
```

各サブエージェントは**自分の進捗ファイルのみ**を読み書きするため、衝突なし。

---

## 📌 重要な原則

1. **進捗ファイルを頻繁に保存**（100語ごと推奨）
2. **チェックポイントも同時保存**（CSV保存と同期）
3. **失敗時は`failed`ステータス**（スキップして続行）
4. **Git管理**：進捗ファイルもコミット

---

**次回作業時**: この設計に基づいて進捗管理スクリプトを実装
