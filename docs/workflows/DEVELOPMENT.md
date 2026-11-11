# Questly 2.0 Development Workflow

## 1. Prerequisites & Environment Setup

### 1.1 Mobile Development (Flutter)
- **Flutter SDK**: `^3.47.0` (Dart `^3.13.0`)
- **Android Studio**: Ladybug / Meerkat with Android SDK Platform 34+
- **Command-line Tools**: `flutter doctor -v` should pass with green checks for Android toolchain.
- **Recommended IDE Extensions**:
  - Flutter & Dart extensions for VS Code / Android Studio
  - GitLens for change inspection and commit history

### 1.2 Web Development (Next.js)
- **Node.js**: `>= 20.0.0`
- **Package Manager**: `npm` (matching `package-lock.json`)

---

## 2. Getting Started

### 2.1 Running the Mobile Application
```bash
# Navigate to mobile project directory
cd mobile

# Install Dart & Flutter dependencies
flutter pub get

# Launch on connected Android device or iOS simulator
flutter run
```

### 2.2 Running the Web Application
```bash
# From repository root
npm install

# Start Next.js local development server with Turbopack
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 3. Git & Branching Guidelines

- **Primary Branch**: `main` is the production branch.
- **Feature Branches**: Branch from `main` using standard naming conventions:
  - `feat/<feature-name>` for new features
  - `fix/<bug-name>` for bug fixes
  - `chore/<task-name>` for maintenance or dependency updates
- **Pull Request Protocol**:
  1. Ensure `flutter analyze` and `flutter test` pass with 0 errors.
  2. Ensure `npm test` and `npx tsc --noEmit` pass with 0 errors.
  3. Format all code with `dart format lib test`.
  4. Submit PR against `main` for review.

