# Questly 2.0 Dependency Audit & Inventory

## 1. Mobile Dependencies (`mobile/pubspec.yaml`)

| Package | Version | Layer | Purpose | Retention Justification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`flutter`** | SDK | Core | Core Flutter framework | Required for cross-platform UI engine | Required |
| **`flutter_riverpod`** | `^3.5.0` | State | Reactive dependency injection & state management | Non-negotiable standard for testable reactive state | Required |
| **`riverpod_annotation`** | `^4.0.8` | State | Riverpod code generation annotations | Supports compile-time safe provider generation | Required |
| **`go_router`** | `^18.1.4` | Routing | Declarative URL-based deep linking & shell routing | Handles 5-branch StatefulShellRoute and modal stacks | Required |
| **`dio`** | `^5.11.1` | Network | HTTP client with interceptor support | Centralized API client with JWT refresh and logging | Required |
| **`shared_preferences`** | `^2.5.6` | Storage | Platform key-value local storage | Fast offline persistence for quests, notes, roadmaps | Required |
| **`flutter_secure_storage`**| `^11.2.0` | Security| Encrypted local storage (Keystore/Keychain) | Secure credential and token storage | Required |
| **`google_fonts`** | `^9.0.0` | Theme | Typography loading (Oswald & Inter) | Essential for Matiks-inspired visual identity | Required |
| **`flutter_svg`** | `^2.3.3` | UI | Scalable vector graphics rendering | Sharp icons and custom vector badges | Required |
| **`cached_network_image`** | `^4.0.6` | UI | Cached remote image loader | Smooth avatar and world asset caching | Required |
| **`fl_chart`** | `^1.3.1` | Analytics| Data visualization & chart rendering | Powering daily productivity pattern bar chart | Required |
| **`intl`** | `^0.20.3` | Core | Internationalization & date formatting | Relative time and calendar formatting in heatmaps | Required |
| **`freezed_annotation`** | `^3.1.0` | Model | Immutable data model annotations | Clean data classes with copyWith and equality | Required |
| **`json_annotation`** | `^4.12.0` | Model | JSON serialization annotations | Type-safe JSON serialization/deserialization | Required |
| **`flutter_test`** | SDK | Testing | Flutter unit & widget testing harness | Fundamental automated test execution | Required |
| **`mocktail`** | `^1.0.5` | Testing | Null-safe Dart mocking library | Mocking repositories and API clients in tests | Required |
| **`flutter_lints`** | `^6.0.0` | Quality | Official Flutter lint rules | Enforcing strict Dart style guidelines | Required |

---

## 2. Web Dependencies (`package.json`)

| Package | Version | Layer | Purpose | Retention Justification | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`next`** | `16.4.3` | Framework | Full-stack React framework (Turbopack) | Core web application platform | Required |
| **`react`** | `19.3.0` | UI | UI component library | Core reactive component tree | Required |
| **`react-dom`** | `19.3.0` | UI | React DOM renderer | Web browser rendering | Required |
| **`tailwindcss`** | `^4` | Styling | Utility-first CSS framework | Responsive styling across web components | Required |
| **`@tailwindcss/turbopack`**| `^4` | Tooling | Turbopack integration for Tailwind | High-speed web development compilation | Required |
| **`lucide-react`** | `^1.62.0` | UI | Modern stroke icons | Visual indicators and iconography in web | Required |
| **`canvas-confetti`** | `^1.9.4` | UI | Confetti celebratory animations | Gamification rewards on quest completion | Required |
| **`clsx`** | `^2.1.1` | Utility | Conditional class string constructor | Composing conditional Tailwind class names | Required |
| **`tailwind-merge`** | `^3.7.0` | Utility | Tailwind class conflict resolver | Safely merging conflicting utility classes | Required |
| **`typescript`** | `^5` | Tooling | Static type checker | Ensuring type safety across all web code | Required |
| **`eslint`** | `^9` | Quality | JavaScript & TypeScript linter | Static analysis of web source files | Required |
| **`eslint-config-next`** | `16.4.3` | Quality | Next.js specific linting rules | Best practices and performance linting | Required |

---

## 3. Decommissioned Legacy Dependencies

The following dependencies belonging to the obsolete standalone Kotlin Android app (`android-app/build.gradle.kts`) have been fully decommissioned:
- `androidx.compose.*` (Jetpack Compose BOM 2024.02.00)
- `androidx.room.*` (Room Database 2.6.1)
- `androidx.navigation:navigation-compose`
- `androidx.datastore:datastore-preferences`
- `org.jetbrains.kotlinx:kotlinx-coroutines-android`
- `androidx.glance:glance-appwidget`

