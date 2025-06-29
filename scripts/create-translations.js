#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 残りの言語の翻訳を作成
const translations = {
  es: {
    "common": {
      "search": "Buscar",
      "loading": "Cargando...",
      "error": "Error",
      "cancel": "Cancelar",
      "close": "Cerrar",
      "next": "Siguiente",
      "previous": "Anterior",
      "start": "Comenzar",
      "finish": "Terminar",
      "tryAgain": "Intentar de nuevo"
    },
    "header": {
      "title": "Género de Sustantivos",
      "subtitle": "Domina los géneros de sustantivos en todos los idiomas",
      "words": "palabras",
      "translations": "traducciones",
      "languages": "idiomas",
      "searchLanguages": "idiomas de búsqueda",
      "searchTerms": "términos de búsqueda",
      "multilingualSearch": "Búsqueda multilingüe"
    },
    "search": {
      "placeholder": "Buscar una palabra... (Presiona '/' para enfocar)",
      "searching": "Buscando...",
      "languagesOptional": "Idiomas (opcional):",
      "noLanguagesSelected": "Ningún idioma seleccionado = buscar en todos los idiomas",
      "noResultsFound": "No se encontraron resultados. Intenta buscar palabras como \"cat\", \"house\" o \"book\".",
      "resultsFound": "{count} resultados encontrados"
    },
    "gender": {
      "masculine": "Masculino",
      "feminine": "Femenino",
      "neuter": "Neutro",
      "m": "♂ Masculino",
      "f": "♀ Femenino",
      "n": "○ Neutro"
    },
    "quiz": {
      "title": "Quiz de Género",
      "description": "¡Pon a prueba tu conocimiento sobre géneros de sustantivos! Obtendrás 10 palabras aleatorias del francés, alemán y español.",
      "startQuiz": "Comenzar Quiz"
    }
  },
  
  it: {
    "common": {
      "search": "Cerca",
      "loading": "Caricamento...",
      "error": "Errore",
      "cancel": "Annulla",
      "close": "Chiudi"
    },
    "header": {
      "title": "Genere dei Sostantivi",
      "subtitle": "Padroneggia i generi dei sostantivi in tutte le lingue"
    },
    "search": {
      "placeholder": "Cerca una parola... (Premi '/' per focalizzare)",
      "searching": "Ricerca..."
    }
  },

  pt: {
    "common": {
      "search": "Pesquisar",
      "loading": "Carregando...",
      "error": "Erro",
      "cancel": "Cancelar",
      "close": "Fechar"
    },
    "header": {
      "title": "Gênero dos Substantivos",
      "subtitle": "Domine os gêneros dos substantivos em todos os idiomas"
    }
  },

  ru: {
    "common": {
      "search": "Поиск",
      "loading": "Загрузка...",
      "error": "Ошибка",
      "cancel": "Отмена",
      "close": "Закрыть"
    },
    "header": {
      "title": "Род Существительных",
      "subtitle": "Освойте роды существительных во всех языках"
    }
  },

  ar: {
    "common": {
      "search": "بحث",
      "loading": "جاري التحميل...",
      "error": "خطأ",
      "cancel": "إلغاء",
      "close": "إغلاق"
    },
    "header": {
      "title": "جنس الأسماء",
      "subtitle": "أتقن أجناس الأسماء في جميع اللغات"
    }
  },

  hi: {
    "common": {
      "search": "खोजें",
      "loading": "लोड हो रहा है...",
      "error": "त्रुटि",
      "cancel": "रद्द करें",
      "close": "बंद करें"
    },
    "header": {
      "title": "संज्ञा लिंग",
      "subtitle": "सभी भाषाओं में संज्ञा लिंगों में महारत हासिल करें"
    }
  },

  zh: {
    "common": {
      "search": "搜索",
      "loading": "加载中...",
      "error": "错误",
      "cancel": "取消",
      "close": "关闭"
    },
    "header": {
      "title": "名词性别",
      "subtitle": "掌握各种语言的名词性别"
    }
  }
};

// 英語テンプレートを読み込み
const enTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/i18n/messages/en.json'), 'utf8'));

// 各言語の翻訳ファイルを作成
Object.entries(translations).forEach(([locale, partialTranslations]) => {
  // 英語をベースに、部分翻訳をマージ
  const mergeDeep = (target, source) => {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  };

  const fullTranslation = mergeDeep(JSON.parse(JSON.stringify(enTemplate)), partialTranslations);
  
  const filePath = path.join(__dirname, `../src/i18n/messages/${locale}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fullTranslation, null, 2));
  console.log(`✅ Created ${locale}.json`);
});

console.log('🎉 All translation files created!');