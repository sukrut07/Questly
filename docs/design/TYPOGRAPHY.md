# Questly 2.0 Typography System Specification

This document details the typographic scale, typeface pairings, tabular numerical rules, and responsive constraints for Questly 2.0.

---

## 1. Typeface Pairings

* **Display & Headlines**: **`Oswald`** (Condensed Google Sans-Serif)
  * Characteristics: High-impact, vertical density, sports and gaming aesthetic.
  * Role: Screen titles, section headers, milestone banners, and challenge callouts.
  * Letter Spacing: `+0.8px` to `+1.4px` (always uppercase or title case).
* **Body & UI Controls**: **`Inter`** (Modern Geometric Sans-Serif)
  * Characteristics: Neutral legibility, tall x-height, extensive weights (400-700).
  * Role: Subtitles, checklist items, note editor paragraphs, form fields, and tooltips.
* **Tabular Numbers & Timers**: **`Inter / Oswald` with Tabular Figures (`tnum`)**
  * Prevents layout jitter during active countdowns (Pomodoro focus timer, Mind Snap 15-second duel countdown, and real-time XP counters).

---

## 2. Typographic Scale

| Role | Font Family | Size | Weight | Line Height | Letter Spacing | Case |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Hero Display** | `Oswald` | 36px | 700 (Bold) | 42px | +1.2px | Uppercase |
| **Page Title** | `Oswald` | 26px | 700 (Bold) | 32px | +1.0px | Uppercase |
| **Section Header**| `Oswald` | 18px | 600 (SemiBold) | 24px | +0.8px | Uppercase |
| **Card Title** | `Inter` | 16px | 600 (SemiBold) | 22px | +0.2px | Title Case |
| **Body Large** | `Inter` | 15px | 400 (Regular) | 22px | 0.0px | Normal |
| **Body Medium** | `Inter` | 13px | 400 (Regular) | 18px | 0.0px | Normal |
| **Caption / Meta**| `Inter` | 11px | 500 (Medium) | 15px | +0.2px | Normal |
| **Micro Badge** | `Oswald` | 10px | 700 (Bold) | 12px | +0.6px | Uppercase |
| **Timer / Score** | `Oswald` | 32px | 700 (Bold) | 36px | +0.5px | Numbers Only |

---

## 3. Responsive Typography Rules

1. **Heading Clamping**:
   - On compact mobile viewports ($\le 390\text{px}$), Hero Display is clamped to `28px` to prevent multi-line overflow.
2. **Tabular Numeral Enforcement**:
   - In Flutter: `fontFeatures: [FontFeature.tabularFigures()]`.
   - In Web CSS: `font-variant-numeric: tabular-nums;`.
3. **Contrast Compliance**:
   - All body copy (`#FFFFFF` or `#A6A6A6`) on `#101010` / `#1E1E1E` meets or exceeds **WCAG AA (4.5:1)** contrast ratios.

