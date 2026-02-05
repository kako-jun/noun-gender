#!/bin/bash

# プロンプト自動生成スクリプト
# Stage 3（性別翻訳）とStage 4（意味翻訳）のプロンプトを全言語分生成

# 言語定義
declare -A LANGUAGES=(
  ["fr"]="French|フランス語|m, f"
  ["de"]="German|ドイツ語|m, f, n"
  ["es"]="Spanish|スペイン語|m, f"
  ["it"]="Italian|イタリア語|m, f"
  ["pt"]="Portuguese|ポルトガル語|m, f"
  ["ru"]="Russian|ロシア語|m, f, n"
  ["ar"]="Arabic|アラビア語|m, f"
  ["hi"]="Hindi|ヒンディー語|m, f"
)

# Stage 3: 性別翻訳プロンプト生成
echo "🔄 Stage 3プロンプト生成中..."
for lang in "${!LANGUAGES[@]}"; do
  IFS='|' read -r lang_en lang_native genders <<< "${LANGUAGES[$lang]}"
  
  sed -e "s/{LANGUAGE}/$lang/g" \
      -e "s/{LANGUAGE_NATIVE}/$lang_native/g" \
      -e "s/{GENDER_OPTIONS}/$genders/g" \
      .claude/prompts/stage3-translate-gender-fr.md > \
      .claude/prompts/stage3-translate-gender-$lang.md
  
  echo "  ✅ stage3-translate-gender-$lang.md"
done

# Stage 4: 意味翻訳プロンプト生成
echo "🔄 Stage 4プロンプト生成中..."
for lang in "${!LANGUAGES[@]}"; do
  IFS='|' read -r lang_en lang_native genders <<< "${LANGUAGES[$lang]}"
  
  sed -e "s/{LANGUAGE}/$lang/g" \
      -e "s/{LANGUAGE_NATIVE}/$lang_native/g" \
      .claude/prompts/stage4-translate-meaning-fr.md > \
      .claude/prompts/stage4-translate-meaning-$lang.md
  
  echo "  ✅ stage4-translate-meaning-$lang.md"
done

echo ""
echo "✅ 全プロンプト生成完了"
echo "   - Stage 3: 8ファイル"
echo "   - Stage 4: 8ファイル"
echo ""
echo "次のステップ:"
echo "  1. Git Worktreeを作成"
echo "  2. 各Worktreeで該当プロンプトを実行"
