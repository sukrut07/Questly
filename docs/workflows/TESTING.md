# Questly 2.0 Testing Guide

This guide describes the testing procedures for both the mobile and web applications in Questly 2.0.

---

## 1. Mobile Automated Testing (Flutter)

### 1.1 Static Analysis & Formatting
Run these commands from `mobile/` before committing:
```bash
cd mobile

# Verify Dart formatting according to official style guidelines
dart format --output=none --set-exit-if-changed lib test

# Run static code analysis with zero tolerance for warnings
flutter analyze
```

### 1.2 Unit & Widget Test Execution
```bash
cd mobile

# Execute all automated test suites
flutter test

# Execute with coverage report
flutter test --coverage
```

### 1.3 Available Mobile Test Suites
- `test/widget_test.dart`: Validates app bootstrap and 5-destination bottom navigation shell.
- `test/matiks_components_test.dart`: Validates `QuestlyButton`, `QuestlyCard`, `QuestlyXPIndicator`, and `QuestlyHeatmap`.
- `test/roadmap_repository_test.dart`: Validates roadmap progress calculation, milestone completion toggles, and templates.
- `test/notebook_repository_test.dart`: Validates note creation, search query filtering, and pinning logic.
- `test/skill_tree_test.dart`: Validates RPG mastery branches and percentage calculation.
- `test/progression_engine_test.dart`: Validates XP thresholds, level calculations, and streak freeze rules.
- `test/reusable_widgets_test.dart`: Validates atomic widget rendering and touch interactions.

---

## 2. Web Automated Testing (Next.js)

Run these commands from the repository root:
```bash
# Execute automated progression unit tests
npm test

# Run TypeScript compiler type check without emitting files
npx tsc --noEmit

# Run Next.js production build verification
npm run build
```

---

## 3. Continuous Integration (CI)

Every pull request and push to `main` triggers `.github/workflows/ci.yml` which executes both test suites in parallel.
