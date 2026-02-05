#!/bin/bash

# プロンプト自動生成スクリプト
# Stage 3（性別翻訳）とStage 4（意味翻訳）のプロンプトを全言語分生成

# 言語定義（言語コード|英語名|ネイティブ名|性別オプション）
declare -a LANGUAGES=(
  "fr|French|フランス語|m (男性名詞: le), f (女性名詞: la)"
  "de|German|ドイツ語|m (男性名詞: der), f (女性名詞: die), n (中性名詞: das)"
  "es|Spanish|スペイン語|m (男性名詞: el), f (女性名詞: la)"
  "it|Italian|イタリア語|m (男性名詞: il), f (女性名詞: la)"
  "pt|Portuguese|ポルトガル語|m (男性名詞: o), f (女性名詞: a)"
  "ru|Russian|ロシア語|m (男性名詞), f (女性名詞), n (中性名詞)"
  "ar|Arabic|アラビア語|m (男性名詞), f (女性名詞)"
  "hi|Hindi|ヒンディー語|m (男性名詞), f (女性名詞)"
)

# Stage 3: 性別翻訳プロンプト生成
echo "🔄 Stage 3プロンプト生成中..."
for lang_def in "${LANGUAGES[@]}"; do
  IFS='|' read -r lang lang_en lang_native genders <<< "$lang_def"
  
  sed -e "s/{LANGUAGE}/$lang/g" \
      -e "s/{LANGUAGE_NATIVE}/$lang_native/g" \
      -e "s/{GENDER_OPTIONS}/$genders/g" \
      .claude/prompts/TEMPLATE-stage3-gender.md > \
      .claude/prompts/stage3-translate-gender-$lang.md
  
  echo "  ✅ stage3-translate-gender-$lang.md"
done

# Stage 4: 意味翻訳プロンプト生成
echo "🔄 Stage 4プロンプト生成中..."
for lang_def in "${LANGUAGES[@]}"; do
  IFS='|' read -r lang lang_en lang_native genders <<< "$lang_def"
  
  sed -e "s/{LANGUAGE}/$lang/g" \
      -e "s/{LANGUAGE_NATIVE}/$lang_native/g" \
      .claude/prompts/TEMPLATE-stage4-meaning.md > \
      .claude/prompts/stage4-translate-meaning-$lang.md
  
  echo "  ✅ stage4-translate-meaning-$lang.md"
done

echo ""
echo "✅ 全プロンプト生成完了"
echo "   - Stage 3: 8ファイル"
echo "   - Stage 4: 8ファイル"
echo ""
echo "検証:"
ls -lh .claude/prompts/stage*.md | awk '{print "  " $9 ": " $5}'
