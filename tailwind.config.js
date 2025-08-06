/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'serif': ['var(--font-source-serif)', 'var(--font-ibm-plex)', 'Courier New', 'Consolas', 'Monaco', 'DejaVu Serif', 'Georgia', 'serif'],
      },
      colors: {
        // 標準色を追加（グラデーション用）
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        yellow: {
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        gray: {
          400: '#9ca3af',
          500: '#6b7280',
        },
        solarized: {
          // Base colors
          'base03': '#002b36',
          'base02': '#073642', 
          'base01': '#586e75',
          'base00': '#657b83',
          'base0': '#839496',
          'base1': '#93a1a1',
          'base2': '#eee8d5',
          'base3': '#fdf6e3',
          // Accent colors
          'yellow': '#b58900',
          'orange': '#cb4b16',
          'red': '#dc322f',
          'magenta': '#d33682',
          'violet': '#6c71c4',
          'blue': '#268bd2',
          'cyan': '#2aa198',
          'green': '#859900',
        }
      }
    },
  },
  plugins: [],
}