# DESIGN.md

noun-gender — Design System

## 1. Visual Theme & Atmosphere

Solarized scholarly aesthetic. A language learning tool that feels like a well-designed reference book — serif typography, warm parchment light mode, deep teal dark mode, and color-coded gender indicators. The Solarized palette brings academic credibility while gender gradients (blue/masculine, pink/feminine, green/neuter) provide instant visual mnemonics.

Inspirations: Solarized terminal themes, dictionary/reference book layouts, language textbook color coding.

## 2. Color Palette & Roles

Tailwind extended with full Solarized palette in `tailwind.config.js`.

### Solarized Base (Light/Dark)

| Token              | Hex       | Usage (Light)        | Usage (Dark)         |
| ------------------ | --------- | -------------------- | -------------------- |
| `solarized-base03` | `#002b36` | —                    | Page background      |
| `solarized-base02` | `#073642` | —                    | Card/header bg       |
| `solarized-base01` | `#586e75` | Primary text, border | —                    |
| `solarized-base00` | `#657b83` | Neutral text         | Neutral text         |
| `solarized-base0`  | `#839496` | —                    | Secondary text       |
| `solarized-base1`  | `#93a1a1` | —                    | Primary text, border |
| `solarized-base2`  | `#eee8d5` | Card/header bg       | —                    |
| `solarized-base3`  | `#fdf6e3` | Page background      | —                    |

### Solarized Accents

| Token       | Hex       | Usage                          |
| ----------- | --------- | ------------------------------ |
| `yellow`    | `#b58900` | Primary action, liked state    |
| `orange`    | `#cb4b16` | Primary button, hover liked    |
| `red`       | `#dc322f` | Error, danger                  |
| `magenta`   | `#d33682` | Feminine gender end            |
| `violet`    | `#6c71c4` | Hover states                   |
| `blue`      | `#268bd2` | Active tab, selected, links    |
| `cyan`      | `#2aa198` | Masculine gender, text highlight |
| `green`     | `#859900` | Neuter gender                  |

### Gender Gradient System

- **Masculine (m):** gray → blue → cyan
- **Feminine (f):** gray → magenta → red
- **Neuter (n):** gray → green → yellow

Applied as 40% opacity overlay on cards.

## 3. Typography Rules

### Font Families

```
"Source Serif 4", "IBM Plex Serif", "Courier New", "Consolas", "Georgia", serif
```

Loaded via Google Fonts: Source Serif 4 (400/600/700/900), IBM Plex Serif (400-700).

### Font Features

Global: `"kern" 1, "liga" 1, "calt" 1`. `text-rendering: optimizeLegibility`.

### Type Scale

| Element      | Class     | Weight | Tracking  |
| ------------ | --------- | ------ | --------- |
| Headings     | h1-h6     | 700    | `-0.03em` |
| Body         | default   | 400    | `-0.01em` |
| Word display | `.word-display` | 600 | `0`    |
| UI elements  | buttons   | 400    | `0`       |

## 4. Component Stylings

### Buttons (class-variance-authority)

**Primary:** `bg-solarized-orange hover:bg-solarized-yellow text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105`

**Secondary:** `bg-solarized-base3 dark:bg-solarized-base03 border-solarized-base1 rounded-xl`

**Ghost:** minimal, hover `bg-solarized-base2 dark:bg-solarized-base02`

**Selected:** `bg-solarized-blue hover:bg-solarized-cyan text-white border-solarized-blue shadow-md`

Sizes: sm (`px-3 py-2`), md (`px-4 py-2`), lg (`px-6 py-3`). All `transition-all duration-200`.

### Word/Translation Cards

- Background: `solarized-base3` / `dark:solarized-base03`
- Border: `solarized-base2` / `dark:solarized-base02`
- Radius: `rounded-lg`
- Hover: `scale-[1.01] shadow-md`
- Gender overlay: absolute gradient at 40% opacity + gender symbol image (80x80 WebP)

### Quiz Modal

- Overlay: `bg-black bg-opacity-30`
- Card: `rounded-2xl p-8 max-w-md shadow-xl`
- Slide animation: 400ms `translate-x` with 50ms offset for new card
- Answer options: `rounded-xl`, `hover:scale-[1.02]`, gender gradient overlay

### Search/Browse Box

- Container: `bg-stone-100 dark:bg-stone-800 rounded-2xl shadow-lg`
- Tabs: active `bg-solarized-blue text-white`, inactive hover `bg-stone-200`
- Search input: `rounded-xl focus:ring-2 focus:ring-blue-500`

### A-Z Index Grid

- Buttons: `w-12 h-12` square, no border-radius
- Letter + count display
- Disabled: `opacity-30` when count is 0

### Range Slider (Custom)

- Track: `h-2 rounded-lg`
- Filled: `#268bd2` (solarized-blue)
- Unfilled: `#93a1a1`
- Thumb: `16px` circle, `#268bd2`, shadow `0 2px 4px rgba(0,0,0,0.2)`

## 5. Layout Principles

### Page Structure

```
min-h-screen flex flex-col
  header (solarized-base2 / dark:base02)
  main (flex-1 container mx-auto px-4 py-8)
  footer (solarized-base2 / dark:base02)
```

### Grid

- Language buttons: `grid-cols-2 sm:grid-cols-4`
- Quiz language select: `grid-cols-1 sm:grid-cols-2`

### Spacing

Standard Tailwind scale. Cards use `p-3` to `p-6`. Sections `gap-2` to `gap-4`.

## 6. Depth & Elevation

### Shadows

- Cards: `shadow-lg`
- Modal: `shadow-xl`
- Buttons: `shadow-md` → `hover:shadow-lg`

### Z-Index

- Quiz modal: `z-50`
- Language dropdown: `z-50`

### Border Radius

| Component | Radius |
| --------- | ------ |
| Buttons   | `rounded-xl` (12px) |
| Cards     | `rounded-lg` (8px) |
| Modal     | `rounded-2xl` (16px) |
| Search    | `rounded-xl` |
| Badges    | `rounded-full` |
| A-Z grid  | `0` (square) |

## 7. Do's and Don'ts

### Do

- Use Solarized palette exclusively — light/dark modes swap base03↔base3
- Apply gender gradient overlays at 40% opacity on word cards
- Use serif fonts (Source Serif 4 / IBM Plex Serif) everywhere
- Enable OpenType features (kern, liga, calt) globally
- Use `transition-all duration-200` on interactive elements
- Apply `hover:scale-105` on buttons, `hover:scale-[1.01]` on cards
- Support 3-state theme toggle (light/dark/system)

### Don't

- Use sans-serif fonts — this is a serif-only design
- Apply gender colors outside the gradient system
- Use border-radius on A-Z grid buttons (square is deliberate)
- Hardcode light/dark colors — always pair `solarized-baseX` with `dark:solarized-baseX`

### Animations

| Animation       | Duration | Notes                  |
| --------------- | -------- | ---------------------- |
| Quiz slide      | 400ms    | `ease-in-out`, translate-x |
| Modal entry     | 300ms    | `slide-in-from-bottom-4 fade-in` |
| Result stagger  | 50ms/item | `slide-in-from-bottom-2` |
| Button hover    | 200ms    | `scale-105`            |
| Loading dots    | 1.5s     | pulse, staggered 0.3s  |

## 8. Responsive Behavior

### Breakpoints

| Name | Value | Changes |
| ---- | ----- | ------- |
| sm   | 640px | Language grid 2→4 cols, quiz 1→2 cols |

Single breakpoint. Mobile-first with `sm:` for wider layouts.

## 9. Agent Prompt Guide

### Solarized Quick Reference

```
Light bg:     #fdf6e3 (base3)      Dark bg:     #002b36 (base03)
Light card:   #eee8d5 (base2)      Dark card:   #073642 (base02)
Light text:   #586e75 (base01)     Dark text:   #93a1a1 (base1)
Accent blue:  #268bd2              Accent cyan: #2aa198
Accent orange:#cb4b16              Accent yellow:#b58900
Gender M:     blue→cyan gradient   Gender F:    magenta→red gradient
Gender N:     green→yellow gradient
```

### When generating UI for this project

- Full Solarized palette. Every color is from the Solarized system
- Serif fonts only (Source Serif 4). No sans-serif
- Gender = gradient overlay. Masculine blue, feminine pink, neuter green
- Light/dark mode swaps base03↔base3 pairs symmetrically
- `rounded-xl` on buttons, `rounded-lg` on cards, `rounded-2xl` on modals
- Quiz uses slide animation (translateX) with direction state
- class-variance-authority for button variants
- next-themes for 3-state theme switching

### Color Emotion Reference

- **Solarized base3 (#fdf6e3):** Warm parchment, scholarly comfort
- **Solarized base03 (#002b36):** Deep teal night, focused study
- **Blue (#268bd2):** Masculine association, clarity
- **Magenta (#d33682):** Feminine association, distinction
- **Green (#859900):** Neuter association, neutrality
- **Orange (#cb4b16):** Action, primary interaction
