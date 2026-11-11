# Questly 2.0 Release & Build Procedures

## 1. Mobile Release Procedures (Flutter)

### 1.1 Android Debug APK Build
To verify the Android platform packaging without code signing keys:
```bash
cd mobile
flutter build apk --debug
```
The output artifact is generated at:
`mobile/build/app/outputs/flutter-apk/app-debug.apk`

### 1.2 Android Release App Bundle (AAB) for Google Play
```bash
cd mobile
flutter build appbundle --release
```
Requires configured keystore credentials in `mobile/android/key.properties`.

### 1.3 iOS Release Archive for App Store
```bash
cd mobile
flutter build ipa --release
```
Requires valid Apple Developer signing certificates in Xcode.

---

## 2. Web Production Build (Next.js)

```bash
# Clean previous builds and compile optimized static assets
npm run build

# Start production server locally to verify performance
npm run start
```

---

## 3. Versioning Strategy

Questly follows Semantic Versioning (`MAJOR.MINOR.PATCH`):
- `mobile/pubspec.yaml`: `version: 2.0.0+1`
- `package.json`: `"version": "0.1.0"` (web application)
- All releases are tagged using standard Git annotated tags: `git tag -a v2.0.0 -m "Questly 2.0.0 release"`

