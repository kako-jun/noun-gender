// 性別スタイルの共通ユーティリティ

export const getGenderStyle = (gender: string): { background: string } => {
  switch (gender) {
    case 'm': 
      // 男性: 無彩色→中央から青→シアンのグラデーション
      return { background: 'linear-gradient(to right, #839496 0%, #839496 50%, #268bd2 75%, #2aa198 100%)' };
    case 'f': 
      // 女性: 無彩色→中央からマゼンタ→赤のグラデーション（紫→赤の順序）
      return { background: 'linear-gradient(to right, #839496 0%, #839496 50%, #d33682 75%, #dc322f 100%)' };
    case 'n': 
      // 中性: 無彩色→中央から緑→黄色のグラデーション
      return { background: 'linear-gradient(to right, #839496 0%, #839496 50%, #859900 75%, #b58900 100%)' };
    default: 
      return { background: '#657b83' };
  }
};

export const getGenderSymbol = (gender: string): string => {
  switch (gender) {
    case 'm': return '♂';
    case 'f': return '♀';
    case 'n': return '⚲';
    default: return '?';
  }
};

export const getGenderLabel = (gender: string): string => {
  switch (gender) {
    case 'm': return 'Masculine';
    case 'f': return 'Feminine';
    case 'n': return 'Neuter';
    default: return gender;
  }
};