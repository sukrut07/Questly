#!/usr/bin/env zsh
set -e
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
unset ANDROID_PREFS_ROOT

echo "=== Building Questly Release APK ==="
echo "JAVA_HOME: $JAVA_HOME"
echo "Working directory: $(pwd)"

cd "$(dirname "$0")"

echo "Running flutter pub get..."
flutter pub get

echo "Running flutter build apk --release..."
flutter build apk --release

echo "=== Build Complete ==="
echo "APK Output: $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
