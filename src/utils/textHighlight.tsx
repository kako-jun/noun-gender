import React from 'react';

/**
 * 検索クエリにマッチする部分をハイライト表示するコンポーネント
 */
interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export const HighlightedText = React.memo(function HighlightedText({ text, query, className = '' }: HighlightedTextProps) {
  // クエリが空の場合はそのまま表示
  if (!query || query.trim() === '') {
    return <span className={className}>{text}</span>;
  }

  // 大文字小文字を無視してマッチ部分を探す
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // マッチした部分を見つける
  const parts: Array<{ text: string; isMatch: boolean }> = [];
  let currentIndex = 0;
  
  while (currentIndex < text.length) {
    const matchIndex = textLower.indexOf(queryLower, currentIndex);
    
    if (matchIndex === -1) {
      // もうマッチする部分がない場合、残りをそのまま追加
      parts.push({ text: text.slice(currentIndex), isMatch: false });
      break;
    }
    
    // マッチ前の部分を追加
    if (matchIndex > currentIndex) {
      parts.push({ text: text.slice(currentIndex, matchIndex), isMatch: false });
    }
    
    // マッチした部分を追加
    parts.push({ 
      text: text.slice(matchIndex, matchIndex + query.length), 
      isMatch: true 
    });
    
    currentIndex = matchIndex + query.length;
  }
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        part.isMatch ? (
          <mark 
            key={index}
            className="text-inherit px-0.5 rounded"
            style={{ 
              backgroundColor: 'rgba(181, 137, 0, 0.25)' // Solarized yellow
            }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </span>
  );
});

/**
 * 複数のクエリに対してハイライト表示
 * 部分一致の場合に使用
 */
export function MultiHighlightedText({ 
  text, 
  queries, 
  className = '' 
}: {
  text: string;
  queries: string[];
  className?: string;
}) {
  // 空のクエリを除去
  const validQueries = queries.filter(q => q && q.trim() !== '');
  
  if (validQueries.length === 0) {
    return <span className={className}>{text}</span>;
  }
  
  // 最初のクエリでハイライト（複数クエリの場合は拡張可能）
  return (
    <HighlightedText 
      text={text} 
      query={validQueries[0]} 
      className={className} 
    />
  );
}