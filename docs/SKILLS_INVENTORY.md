# Questly 2.0 Agent Skills & Technology Inventory

This document records the Agent Skills, plugins, and dependencies evaluated and maintained for the Questly repository.

---

## 1. Agent Skills & Marketplace Catalog Evaluation

| Skill / Plugin Name | Catalog Identifier | Source / Publisher | Purpose | Trust Assessment | Installation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Supabase** | `antigravity-plugins-partners/plugin/supabase` | Supabase Partner Plugin | PostgreSQL schema design, Auth, Row Level Security, Edge Functions | **Verified Official** | Suggested for Agent MCP integration |
| **Dart and Flutter** | `antigravity-plugins-official/plugin/flutter` | Google Official | Flutter architecture, Riverpod conventions, Dart analyzer tooling | **Verified Official** | Suggested for Flutter agent workflows |
| **Google Developer Knowledge** | `antigravity-plugins-official/plugin/google-developer-knowledge` | Google Official | Authoritative documentation lookup across Android, Flutter, and Web | **Verified Official** | Available via catalog |
| **AGY Customizations** | Built-in | Antigravity Core | Customization discovery, rule loading, and hook execution | **Verified Core** | Available |
| **Generative UI** | Built-in | Antigravity Core | Rich visual and interactive widgets inline in chat | **Verified Core** | Available |

---

## 2. Production Dependencies Inventory

### 2.1 Mobile Application (`mobile/pubspec.yaml`)

| Package | Version | Responsibility | Justification |
| :--- | :--- | :--- | :--- |
| `flutter_riverpod` | `^3.5.0` | Reactive State Management | Compile-safe dependency injection without `BuildContext` coupling. |
| `go_router` | `^18.1.4` | Declarative Routing | Deep linking support, nested shell routes, and URL-based navigation. |
| `dio` | `^5.11.1` | HTTP & REST Client | Interceptors for auth tokens, retry handling, and request logging. |
| `shared_preferences` | `^2.5.6` | Key-Value Local Storage | App preferences, cached widget data, and theme persistence. |
| `flutter_secure_storage` | `^11.2.0` | Keychain / Keystore | Secure storage for sensitive JWT tokens and session secrets. |
| `fl_chart` | `^1.3.1` | Data Visualizations | High-performance 60 FPS charts for productivity analytics. |
| `google_fonts` | `^9.0.0` | Typography | Dynamic loading for Oswald display headers and Inter body sans. |

### 2.2 Web Application (`package.json`)

| Package | Version | Responsibility | Justification |
| :--- | :--- | :--- | :--- |
| `next` | `16.4.3` | App Router Web Framework | React Server Components, Turbopack bundling, and edge rendering. |
| `react` / `react-dom`| `19.3.0` | UI Rendering Engine | Latest concurrent rendering and server actions support. |
| `tailwindcss` | `^4.0.0` | Styling Engine | Modern zero-runtime CSS with custom Matiks design tokens. |
| `lucide-react` | `^1.62.0` | Iconography | Clean, consistent developer-grade SVG icons. |
| `canvas-confetti` | `^1.9.4` | Gamification Micro-Effects | Lightweight celebratory particles on quest/duel completion. |

