# Questly 2.0 Reusable Component Library Specification

This document details the visual and behavioral specifications for Questly's neo-brutalist, Matiks-inspired component system.

---

## 1. Buttons & CTA System

### 1.1 `QuestlyButton`
* **Primary (Electric Lime)**:
  * Background: `#B5FF55`
  * Text Color: `#000000` (High contrast, bold uppercase)
  * Border: `1px solid #B5FF55`
  * Padding: `16px 24px` (Large), `12px 18px` (Medium), `8px 12px` (Small)
  * Radius: `12px`
  * Interaction: Spring-scale press to `0.96` with `120ms` duration.
* **Secondary (Lavender)**:
  * Background: `rgba(185, 163, 255, 0.15)`
  * Text Color: `#B9A3FF`
  * Border: `1px solid rgba(185, 163, 255, 0.4)`
* **Outline / Ghost**:
  * Background: `transparent`
  * Text Color: `#FFFFFF`
  * Border: `1px solid #343434`

---

## 2. Cards & Data Display

### 2.1 `QuestlyCard`
* **Dimensions & Geometry**:
  * Background: `#1E1E1E` (Dark charcoal)
  * Border: `1px solid #343434`
  * Radius: `16px`
  * Padding: `16px` (Standard), `20px` (Feature cards)
  * Shadow: Subtle ambient elevation (`rgba(0, 0, 0, 0.4)` offset `0px 4px`, blur `12px`).
* **Hover / Tap States**:
  * Scale to `0.985` on press.
  * Border shifts from `#343434` to `#4A4A4A` (or accent color when selected).

### 2.2 `TodayChallengeBanner` (Split Card)
* Asymmetrical dual card presentation:
  * **PUZZLE**: Left block with lavender typography (`#B9A3FF`) and chevron `‣`.
  * **FOCUS / MATH**: Right block with tangerine orange typography (`#FFA24C`) and chevron `‣`.

### 2.3 `FocusSquadBar`
* **Showdown Timer Ring**:
  * Gold circular border (`#F5C96A`) containing duel countdown timer (`04:21 HRS`).
* **Active Partner Avatars**:
  * Circular portraits (40px) with green active presence indicator dot (`#48BB78`) at bottom-right.

---

## 3. Analytics & Visualization Components

### 3.1 `QuestlyHeatmap`
* **Calendar Grid**:
  * 7 rows (days of week) $\times$ $N$ columns (weeks).
  * Cell size: `12px × 12px` with `3px` spacing and `3px` corner radius.
  * Intensity Palette:
    * Level 0: `#1E1E1E` (Empty)
    * Level 1: `rgba(181, 255, 85, 0.25)`
    * Level 2: `rgba(181, 255, 85, 0.50)`
    * Level 3: `rgba(181, 255, 85, 0.75)`
    * Level 4: `#B5FF55` (Peak)
* **Interactive Tooltip**:
  * Displays localized date, total XP earned, and focus minutes upon cell tap.

### 3.2 `QuestlyXPIndicator`
* Pill-shaped container (`#1A1A1A`) with glowing gold or lime icon and bold tabular numeral XP text.
