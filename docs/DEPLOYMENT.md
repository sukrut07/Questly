# Questly 2.0 Production Deployment & Release Guide

This guide outlines the production deployment workflows for both the Web application and Mobile applications.

---

## 1. Web Application Deployment (Next.js / Vercel)

1. **Connect Repository**:
   - Link `https://github.com/sukrut07/Questly` to Vercel or your hosting platform.
2. **Configure Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-production-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. **Build & Output Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Output Directory: `.next`
4. **Deploy**:
   - Trigger production deployment. Automatic SSL and CDN edge caching are configured.

---

## 2. Mobile Application Deployment (Flutter)

### 2.1 Android Release (Google Play Console)
1. **Configure Keystore**:
   - Generate release key:
     ```bash
     keytool -genkey -v -keystore android/app/upload-keystore.jks \
       -keyalg RSA -keysize 2048 -validity 10000 -alias upload
     ```
   - Reference key in `android/key.properties` (never commit this file).
2. **Build Android App Bundle (AAB)**:
   ```bash
   cd mobile
   flutter build appbundle --release \
     --dart-define=SUPABASE_URL=https://your-production-ref.supabase.co \
     --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
   Output: `build/app/outputs/bundle/release/app-release.aab`.
3. **Upload to Google Play Console**:
   - Submit the AAB to an internal testing track, complete store listing, and publish.

### 2.2 iOS Release (Apple App Store / TestFlight)
1. **Configure Signing**:
   - Open `mobile/ios/Runner.xcworkspace` in Xcode.
   - Select your Apple Developer Team under **Signing & Capabilities**.
   - Enable **App Groups** capability (`group.com.questly.app`) for WidgetKit data sharing.
2. **Build IPA / Archive**:
   ```bash
   cd mobile
   flutter build ipa --release \
     --dart-define=SUPABASE_URL=https://your-production-ref.supabase.co \
     --dart-define=SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. **Distribute via TestFlight**:
   - Upload via Xcode Organizer or `xcrun altool`.

