// 性別スタイルの共通ユーティリティ

export const getGenderStyle = (gender: string): string => {
  switch (gender) {
    case 'm': 
      return 'bg-gradient-to-r from-solarized-base00 to-solarized-blue dark:from-solarized-base0 dark:to-solarized-blue';
    case 'f': 
      return 'bg-gradient-to-r from-solarized-base00 to-solarized-red dark:from-solarized-base0 dark:to-solarized-red';
    case 'n': 
      return 'bg-solarized-base00 dark:bg-solarized-base0';
    default: 
      return 'bg-solarized-base00 dark:bg-solarized-base0';
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
    case 'm': return '♂ Masculine';
    case 'f': return '♀ Feminine';
    case 'n': return '⚲ Neuter';
    default: return gender;
  }
};