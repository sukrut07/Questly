# Questly 2.0 Mobile Application

Welcome to **Questly 2.0**, the cross-platform mobile client for the Questly gamified productivity ecosystem. Built with Flutter, Dart, Riverpod, and GoRouter.

---

## 1. Quick Start

### Prerequisites
- Flutter SDK (>= 3.24.0, tested on 3.47.x stable)
- Dart SDK (>= 3.13.0)
- Android Studio / Xcode

### Setup & Launch
From the `mobile/` directory:

```bash
# 1. Fetch dependencies
flutter pub get

# 2. Verify static analysis
flutter analyze

# 3. Run test suite
flutter test

# 4. Launch on connected device, emulator, or simulator
flutter run
```

---

## 2. Running in Android Studio

1. Open Android Studio.
2. Select **Open** and choose the `~/Documents/Projects/SY/Questly/Questly/mobile` folder.
3. Allow Android Studio to sync the Dart & Flutter project.
4. Select an Android Virtual Device (AVD) or connected physical device in the device dropdown.
5. Click the green **Run** button (or press `Shift + F10`).

---

## 3. Running on iOS

From macOS with Xcode installed:

```bash
cd ios
pod install # if CocoaPods is used
cd ..
flutter run -d iPhone
```

---

## 4. Architecture & Directory Structure

Questly 2.0 implements **Clean Architecture** with a **Feature-First** modular organization:

```
lib/
├── app/                  # Application bootstrap, root widget, routing & theming
│   ├── app.dart
│   ├── bootstrap.dart
│   ├── providers/        # Riverpod providers for theme, repositories, storage
│   ├── router/           # GoRouter route declarations & bottom nav shell
│   └── theme/            # Design tokens: AppColors, AppTheme, AppTypography, AppSpacing
│
├── config/               # Environment configs (dev, staging, prod)
│
├── core/                 # Shared infrastructure (network, errors, storage, utils)
│   ├── constants/
│   ├── errors/
│   ├── network/          # Dio ApiClient & auth interceptor
│   ├── storage/          # SharedPreferences & SecureStorage interfaces
│   └── utils/
│
├── features/             # Modular business features
│   ├── dashboard/        # Living World progression, streak tracking, quick actions
│   ├── quests/           # Quests list, create quest form, detail checklist
│   ├── tasks/            # Daily task commitments
│   ├── gamification/     # XP progression engine & streak calculation
│   ├── analytics/        # Focus analytics & productivity metrics
│   ├── profile/          # Adventurer profile & theme customization
│   ├── settings/         # App configuration & preferences
│   ├── achievements/     # Badges & trophies
│   ├── notifications/    # Streak alerts & daily reminders
│   ├── onboarding/       # Introductory carousel
│   └── auth/             # Sign in & guest access
│
└── shared/               # Cross-feature domain models, enums & reusable widgets
    ├── enums/
    ├── models/
    └── widgets/          # AppButton, AppCard, AppLoader, AppTextField, XpProgressBar
```

---

## 5. Technology Stack & Dependencies

- **State Management**: `flutter_riverpod` (v3.5)
- **Routing**: `go_router` (v18.1)
- **Networking**: `dio` (v5.11)
- **Local Key-Value**: `shared_preferences` (v2.5)
- **Encrypted Storage**: `flutter_secure_storage` (v11.2)
- **Design & Typography**: Material 3, `google_fonts`, `flutter_svg`, `cached_network_image`
- **Testing**: `flutter_test`, `mocktail`

---

## 6. Development & Quality Commands

```bash
# Code formatting
dart format lib test

# Static analysis
flutter analyze

# Execute tests
flutter test

# Run tests with coverage
flutter test --coverage

# Build debug APK
flutter build apk --debug
```
