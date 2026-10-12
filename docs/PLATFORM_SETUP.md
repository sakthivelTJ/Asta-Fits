# Platform Setup — Phase 7: Camera Rep Counting & Health Data

This document lists every native change required for Phase 7. The app uses
**Expo SDK 52 in bare workflow** (after `expo prebuild`). Run `expo prebuild`
once after installing the packages below, then use `npx react-native run-android`
or `npx react-native run-ios`.

---

## 1. Install npm packages

```bash
# Camera + ML Kit pose detection
npm install react-native-vision-camera@4 vision-camera-pose-detection
npm install react-native-worklets-core  # required by VisionCamera frame processors

# Health data
npm install react-native-health          # iOS HealthKit
npm install react-native-health-connect  # Android Health Connect

# Then generate native folders
npx expo prebuild
```

> **Package versions used:**
> - `react-native-vision-camera` 4.x
> - `vision-camera-pose-detection` 1.x (ML Kit wrapper)
> - `react-native-health` 4.x
> - `react-native-health-connect` 3.x

---

## 2. Android changes

### 2a. `android/app/src/main/AndroidManifest.xml`

Add the following permissions and entries **inside** `<manifest>`:

```xml
<!-- Camera permission for rep counting -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Health Connect permissions -->
<uses-permission android:name="android.permission.health.READ_STEPS" />
<uses-permission android:name="android.permission.health.READ_SLEEP" />
```

Add **inside** `<application>`:

```xml
<!-- Health Connect rationale activity (required by Play Store policy) -->
<activity
    android:name="androidx.health.connect.client.PermissionController"
    android:exported="true">
    <intent-filter>
        <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
    </intent-filter>
</activity>
```

Add **inside** `<manifest>` (outside `<application>`):

```xml
<!-- Required to query Health Connect app -->
<queries>
    <package android:name="com.google.android.apps.healthdata" />
</queries>
```

### 2b. `android/app/build.gradle`

Ensure `minSdkVersion` is at least **26** (required by Health Connect):

```gradle
android {
    defaultConfig {
        minSdkVersion 26   // was 23 — bump to 26 for Health Connect
        ...
    }
}
```

### 2c. `android/app/src/main/java/.../MainActivity.kt` (or `.java`)

Change `FlutterActivity` → `FlutterFragmentActivity` (required by VisionCamera):

```kotlin
// Before:
class MainActivity : FlutterActivity()

// After:
import io.flutter.embedding.android.FlutterFragmentActivity
class MainActivity : FlutterFragmentActivity()
```

> **Note:** In React Native bare workflow this is actually `ReactActivity`.
> VisionCamera v4 does **not** require this change for React Native.
> This entry is included for completeness per the spec.

### 2d. `android/app/build.gradle` — VisionCamera frame processors

Add to `android` block (enables the Worklets/JSI frame processor):

```gradle
android {
    ...
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    }
}
```

---

## 3. iOS changes

### 3a. `ios/AstasFit/Info.plist`

Add the following usage description strings:

```xml
<key>NSCameraUsageDescription</key>
<string>Counts your reps on this device. Video is never saved or uploaded.</string>

<key>NSHealthShareUsageDescription</key>
<string>Asta's Fit reads your step count and sleep duration to award Vitality points. No raw health data leaves your device.</string>

<key>NSHealthUpdateUsageDescription</key>
<string>Asta's Fit does not write any health data.</string>
```

### 3b. HealthKit capability

In Xcode → your target → **Signing & Capabilities** → **+ Capability** → add **HealthKit**.

Or add directly to `ios/AstasFit.entitlements`:

```xml
<key>com.apple.developer.healthkit</key>
<true/>
<key>com.apple.developer.healthkit.access</key>
<array/>
```

### 3c. `ios/Podfile` — iOS minimum version

`google_mlkit_pose_detection` (ML Kit) requires **iOS 13**:

```ruby
# Change:
platform :ios, '12.4'

# To:
platform :ios, '13.0'
```

Then run:

```bash
cd ios && pod install
```

---

## 4. Running the app after setup

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

> Expo Go **will not work** for Phase 7 features.
> Use a physical device or an emulator with camera support.

---

## 5. What could not be verified without a real device

- Camera pose detection accuracy and rep counting
- Health Connect step/sleep reading on Android
- HealthKit step/sleep reading on iOS
- Permission denial flows on both platforms

All other logic (rep counter algorithm, health math, Cloud Function validation) is fully unit-tested.
