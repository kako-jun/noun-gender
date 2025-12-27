# Noun Gender

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

A web app for learning grammatical gender in languages like French, German, Spanish, and more. Search 4,600+ words across 8 languages with translations, meanings, and memory tricks.

## Features

- **Multi-language Search** — Find words in English or any of the 8 supported languages
- **Gender Quiz** — Test your knowledge with interactive quizzes
- **A-Z Browse** — Explore the dictionary alphabetically
- **Audio Pronunciation** — Listen to native pronunciation via Web Speech API
- **Memory Tricks** — Helpful hints to remember word genders
- **Dark/Light Theme** — Solarized color scheme with theme toggle
- **11 UI Languages** — Interface available in English, Japanese, Chinese, and more

## Supported Languages

| Language | Gender System |
|----------|---------------|
| 🇫🇷 French | Masculine / Feminine |
| 🇩🇪 German | Masculine / Feminine / Neuter |
| 🇪🇸 Spanish | Masculine / Feminine |
| 🇮🇹 Italian | Masculine / Feminine |
| 🇵🇹 Portuguese | Masculine / Feminine |
| 🇷🇺 Russian | Masculine / Feminine / Neuter |
| 🇸🇦 Arabic | Masculine / Feminine |
| 🇮🇳 Hindi | Masculine / Feminine |

## How to Use

### Search

Type any word in the search box. Results show:
- The word in your selected language
- Gender indicator (m/f/n)
- English meaning
- Audio playback button

### Browse

Click any letter (A-Z) to browse all words starting with that letter. Scroll down for infinite loading.

### Quiz

Select a language and test yourself:
1. A word appears in English
2. Choose the correct gender
3. See your score and streak

## API Access

The app exposes a simple REST API for programmatic access:

```
GET /api/search?q=house&lang=de
```

Returns:
```json
{
  "results": [
    {
      "en": "house",
      "translation": "Haus",
      "gender": "n",
      "meaning": "A building for human habitation"
    }
  ]
}
```

## License

MIT License — feel free to use, modify, and distribute.

---

Made with ❤️ for language learners
