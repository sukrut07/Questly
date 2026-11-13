# Questly 2.0 Color Tokens & Palette Architecture

This document defines the centralized design token system for Questly 2.0, inspired by the high-contrast, dark-mode gaming aesthetic of Matiks.

---

## 1. Palette Hierarchy

```
                                    ┌──────────────────────┐
                                    │    CANVAS / SURFACES │
                                    │   #101010 • #171717  │
                                    │   #1E1E1E • #262626  │
                                    └──────────┬───────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               │                                                               │
               ▼                                                               ▼
 ┌───────────────────────────┐                                   ┌───────────────────────────┐
 │       BRAND ACCENTS       │                                   │    CATEGORY IDENTIFIERS   │
 │                           │                                   │                           │
 │ • Electric Lime:  #B5FF55 │                                   │ • Academics:   #67B8FF    │
 │ • Soft Lavender:  #B9A3FF │                                   │ • Programming: #69D8A5    │
 │ • Cyber Purple:   #9575F5 │                                   │ • Fitness:     #FFA24C    │
 │ • Dark Border:    #343434 │                                   │ • Reading:     #B9A3FF    │
 └───────────────────────────┘                                   │ • Wellness:    #FF8EAB    │
                                                                 └───────────────────────────┘
```

---

## 2. Token Definitions

### 2.1 Surfaces & Depth
| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| `surface.base` | `#101010` | Main application background (dark charcoal canvas). |
| `surface.elevated` | `#171717` | Navigation bars, headers, and section containers. |
| `surface.card` | `#1E1E1E` | Primary interactive cards, bento tiles, and task items. |
| `surface.highlight`| `#262626` | Active states, hover overlays, and modal backgrounds. |
| `border.default` | `#343434` | Crisp 1px borders delineating cards and input zones. |
| `border.subtle` | `#222222` | Internal dividers and non-interactive grid lines. |

### 2.2 Brand Accents
| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| `accent.lime` | `#B5FF55` | Primary CTA buttons, level-up banners, active navigation items. |
| `accent.lime.muted` | `rgba(181, 255, 85, 0.15)` | Pill backgrounds, subtle badge fills, and glow halos. |
| `accent.lavender` | `#B9A3FF` | Secondary action buttons, puzzle tags, and streak flame highlights. |
| `accent.lavender.muted` | `rgba(185, 163, 255, 0.15)` | Category chips and secondary interactive states. |

### 2.3 Productivity Category Tokens
| Category | Hex Code | Visual Symbol |
| :--- | :--- | :--- |
| **Academics & Study** | `#67B8FF` | Cyber Blue (Coursework, math, theory) |
| **Programming** | `#69D8A5` | Emerald Green (DSA, system design, coding) |
| **Fitness & Health** | `#FFA24C` | Vivid Tangerine (Workouts, running, physical health) |
| **Reading & Notes** | `#B9A3FF` | Soft Lavender (Book chapters, articles, literature) |
| **Personal Development** | `#FF8EAB` | Bubblegum Pink (Journaling, reflection, habits) |
| **General Productivity**| `#B5FF55` | Electric Lime (Quests, errands, chores) |

### 2.4 Typography & Text Contrast
| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| `text.primary` | `#FFFFFF` | High-contrast headers, numbers, and primary button labels. |
| `text.secondary` | `#A6A6A6` | Subtitles, checklist items, and descriptions. |
| `text.tertiary` | `#727272` | Timestamps, metadata, and placeholder text. |
| `text.inverse` | `#000000` | Text on electric lime and solid accent surfaces. |

---

## 3. Implementation Code

### 3.1 Web (Tailwind CSS v4 & CSS Variables)
```css
:root {
  --color-dark-base: #101010;
  --color-dark-surface: #171717;
  --color-dark-card: #1e1e1e;
  --color-dark-border: #343434;

  --color-lime-primary: #b5ff55;
  --color-lavender-secondary: #b9a3ff;

  --color-cat-academics: #67b8ff;
  --color-cat-programming: #69d8a5;
  --color-cat-fitness: #ffa24c;
  --color-cat-reading: #b9a3ff;
  --color-cat-wellness: #ff8eab;
}
```

### 3.2 Flutter (`AppColors`)
```dart
class AppColors {
  static const Color darkBase = Color(0xFF101010);
  static const Color darkSurface = Color(0xFF171717);
  static const Color darkCard = Color(0xFF1E1E1E);
  static const Color darkBorder = Color(0xFF343434);

  static const Color limePrimary = Color(0xFFB5FF55);
  static const Color lavenderSecondary = Color(0xFFB9A3FF);

  static const Color catAcademics = Color(0xFF67B8FF);
  static const Color catProgramming = Color(0xFF69D8A5);
  static const Color catFitness = Color(0xFFFFA24C);
  static const Color catReading = Color(0xFFB9A3FF);
  static const Color catWellness = Color(0xFFFF8EAB);
}
```

