# Questly 2.0 Responsive Layout & Breakpoint Specification

This document details the responsive layout engine, column grids, and adaptive behaviors across mobile, tablet, and desktop viewports.

---

## 1. Breakpoint Definitions

| Screen Class | Viewport Range | Target Devices | Layout Mode |
| :--- | :--- | :--- | :--- |
| **Mobile Compact** | `320px` to `390px` | iPhone SE, iPhone mini | Single column, tight 12px margins, 14-wk heatmap |
| **Mobile Standard** | `391px` to `480px` | iPhone 15/16, Pixel 8/9 | Single column, standard 16px margins, horizontal carousels |
| **Tablet / Foldable**| `481px` to `1023px` | iPad mini, iPad 10th gen | 2-column adaptive bento grid, persistent side rail |
| **Desktop / Laptop** | $\ge 1024px$ | MacBook, 1080p/4K Monitors | 3-column bento grid, collapsible navigation sidebar |

---

## 2. Adaptive Navigation Paradigms

```
  [Mobile Viewports: < 768px]                       [Desktop Viewports: >= 1024px]

  ┌─────────────────────────────┐         ┌──────────┬─────────────────────────────┬──────────┐
  │ Top Status Header (XP/Coins)│         │ Sidebar  │ Main Dashboard Bento Grid   │ Widgets  │
  ├─────────────────────────────┤         │          │                             │          │
  │                             │         │  Quests  │ [Progression] [Today Duel]  │ Focus    │
  │ Single-Column Scroll Content│         │  Arcade  │                             │ Squad    │
  │                             │         │  Roadmap │ [Activity Heatmap 52-Week]  │          │
  │                             │         │  Notes   │                             │ Notes    │
  ├─────────────────────────────┤         │  Settings│ [Active Tasks Checklist]   │ Queue    │
  │ Bottom Navigation Bar (5)   │         └──────────┴─────────────────────────────┴──────────┘
  └─────────────────────────────┘
```

---

## 3. Touch Target & Accessibility Compliance

* **Minimum Hit Box**: All buttons, checklist checkboxes, and navigation icons maintain a minimum interactive bounding box of **$48\text{px} \times 48\text{px}$** on touch screens.
* **Scroll Optimization**: All horizontal carousels (Focus Squad, Quick Actions, Category Chips) employ iOS-style bouncing physics with gentle edge padding.
