# 翻訳ワークフロー追跡システム

## 概要

各英単語（4,592語）のワークフロー進捗を追跡するシステム。

## ワークフローステージ定義

| Stage | 名称 | 成果物 | 完了条件 |
|-------|------|--------|---------|
| 1 | 英語意味定義 | meaning_en | セミコロン区切りの複数意味 |
| 2 | 英語例文 | example_en | 最初の意味を使った例文 |
| 3 | 性別翻訳（8言語） | {lang}_translation, {lang}_gender | 8言語すべて完了 |
| 4 | 意味翻訳（10言語） | meaning_{lang} | 10言語すべて完了 |
| 5 | 例文翻訳（10言語） | example_translations | 10言語すべて完了 |
| 6 | 記憶術（24組合せ） | memory_tricks | 8言語×3UI言語 |

## ワークフロー状態の判定方法

### スクリプト: `scripts/check-workflow-progress.js`

```javascript
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Stage定義
const STAGES = {
  1: { name: '英語意味定義', file: 'word_gender_translations.csv', column: 'meaning_en' },
  2: { name: '英語例文', file: 'word_examples.csv', column: 'example_en' },
  3: { 
    name: '性別翻訳', 
    file: 'word_gender_translations.csv',
    columns: ['fr_translation', 'de_translation', 'es_translation', 'it_translation',
              'pt_translation', 'ru_translation', 'ar_translation', 'hi_translation']
  },
  4: {
    name: '意味翻訳',
    file: 'word_meaning_translations.csv',
    columns: ['meaning_ja', 'meaning_zh', 'meaning_fr', 'meaning_de', 'meaning_es',
              'meaning_it', 'meaning_pt', 'meaning_ru', 'meaning_ar', 'meaning_hi']
  }
};

async function checkWordProgress(en) {
  const progress = { en, stages: {} };
  
  // Stage 1-4をチェック
  for (const [stageNum, stageDef] of Object.entries(STAGES)) {
    const filePath = path.join('data', stageDef.file);
    const rows = await readCSV(filePath, { en });
    
    if (rows.length === 0) {
      progress.stages[stageNum] = { status: 'missing', completed: 0, total: 1 };
      continue;
    }
    
    const row = rows[0];
    
    if (stageDef.column) {
      // 単一列チェック
      progress.stages[stageNum] = {
        status: row[stageDef.column]?.trim() ? 'completed' : 'pending',
        completed: row[stageDef.column]?.trim() ? 1 : 0,
        total: 1
      };
    } else {
      // 複数列チェック
      const completed = stageDef.columns.filter(col => row[col]?.trim()).length;
      const total = stageDef.columns.length;
      progress.stages[stageNum] = {
        status: completed === total ? 'completed' : completed > 0 ? 'in_progress' : 'pending',
        completed,
        total
      };
    }
  }
  
  return progress;
}

async function generateWorkflowReport() {
  const genderCSV = path.join('data', 'word_gender_translations.csv');
  const words = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(genderCSV)
      .pipe(csv({ separator: '\t' }))
      .on('data', (row) => words.push(row.en))
      .on('end', resolve)
      .on('error', reject);
  });
  
  const report = {
    total_words: words.length,
    by_stage: {},
    by_letter: {},
    words: []
  };
  
  // 各単語のステージ進捗をチェック
  for (const en of words) {
    const progress = await checkWordProgress(en);
    report.words.push(progress);
    
    // 文字別集計
    const firstLetter = en[0].toUpperCase();
    if (!report.by_letter[firstLetter]) {
      report.by_letter[firstLetter] = {
        total: 0,
        completed: 0,
        in_progress: 0,
        pending: 0
      };
    }
    report.by_letter[firstLetter].total++;
    
    // 全ステージ完了かチェック
    const allCompleted = Object.values(progress.stages).every(s => s.status === 'completed');
    if (allCompleted) {
      report.by_letter[firstLetter].completed++;
    } else {
      const anyInProgress = Object.values(progress.stages).some(s => s.status === 'in_progress');
      if (anyInProgress) {
        report.by_letter[firstLetter].in_progress++;
      } else {
        report.by_letter[firstLetter].pending++;
      }
    }
  }
  
  // ステージ別集計
  for (let stage = 1; stage <= 4; stage++) {
    report.by_stage[stage] = {
      completed: report.words.filter(w => w.stages[stage]?.status === 'completed').length,
      in_progress: report.words.filter(w => w.stages[stage]?.status === 'in_progress').length,
      pending: report.words.filter(w => w.stages[stage]?.status === 'pending').length
    };
  }
  
  return report;
}

// ヘルパー関数
function readCSV(filePath, filter = {}) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: '\t' }))
      .on('data', (row) => {
        if (!filter.en || row.en === filter.en) {
          rows.push(row);
        }
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

module.exports = { checkWordProgress, generateWorkflowReport };
```

## 使用方法

### 全体進捗レポート生成

```bash
node scripts/check-workflow-progress.js > .claude/workflow/progress-report.json
```

### 特定の単語の進捗確認

```bash
node scripts/check-workflow-progress.js abbey
```

## レポート形式

```json
{
  "total_words": 4592,
  "by_stage": {
    "1": { "completed": 4592, "in_progress": 0, "pending": 0 },
    "2": { "completed": 4592, "in_progress": 0, "pending": 0 },
    "3": { "completed": 0, "in_progress": 4592, "pending": 0 },
    "4": { "completed": 0, "in_progress": 4592, "pending": 0 }
  },
  "by_letter": {
    "A": { "total": 312, "completed": 0, "in_progress": 312, "pending": 0 },
    "B": { "total": 387, "completed": 0, "in_progress": 387, "pending": 0 }
  },
  "words": [
    {
      "en": "abbey",
      "stages": {
        "1": { "status": "completed", "completed": 1, "total": 1 },
        "2": { "status": "completed", "completed": 1, "total": 1 },
        "3": { "status": "in_progress", "completed": 6, "total": 8 },
        "4": { "status": "in_progress", "completed": 8, "total": 10 }
      }
    }
  ]
}
```

## 進捗可視化

### Markdown形式のサマリー生成

```bash
node scripts/generate-workflow-summary.js > .claude/workflow/summary.md
```

生成例:

```markdown
# ワークフロー進捗サマリー

## 全体進捗

| Stage | 完了 | 進行中 | 未着手 | 進捗率 |
|-------|------|--------|--------|--------|
| Stage 1: 英語意味定義 | 4,592 | 0 | 0 | 100% |
| Stage 2: 英語例文 | 4,592 | 0 | 0 | 100% |
| Stage 3: 性別翻訳 | 0 | 4,592 | 0 | 58% |
| Stage 4: 意味翻訳 | 0 | 4,592 | 0 | 65% |

## 文字別進捗

| 文字 | 総数 | 完了 | 進行中 | 未着手 |
|------|------|------|--------|--------|
| A | 312 | 0 | 312 | 0 |
| B | 387 | 0 | 387 | 0 |
...
```

---

**最終更新**: 2025-02-05  
**管理者**: Claude Code Assistant
