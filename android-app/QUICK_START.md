# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Open Project
```bash
# Open Android Studio
# File → Open → Select "android-app" folder
# Wait for Gradle sync to complete
```

### 2. Run the App
```bash
# Connect Android device or start emulator
# Click Run (▶) in Android Studio
# Or: ./gradlew installDebug
```

### 3. Configure AdMob (Optional)

**For Testing (Already Configured):**
- Uses Google's test ad IDs
- No real ads shown
- Perfect for development

**For Production:**
1. Create AdMob account at https://admob.google.com
2. Create app in AdMob dashboard
3. Get your App ID and Ad Unit IDs
4. Update these files:

**`android-app/app/src/main/AndroidManifest.xml`:**
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-YOUR_APP_ID"/>
```

**`android-app/app/src/main/java/com/medicscientist/calculator/ads/AdManager.kt`:**
```kotlin
private const val BANNER_AD_UNIT_ID = "ca-app-pub-YOUR_BANNER_ID"
private const val INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-YOUR_INTERSTITIAL_ID"
```

### 4. Build Release APK
```bash
./gradlew assembleRelease
```

APK location: `app/build/outputs/apk/release/app-release.apk`

## 📱 Testing on Device

### Enable Developer Options
1. Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back → Developer Options → Enable USB Debugging

### Install APK
```bash
adb install app/build/outputs/apk/release/app-release.apk
```

## 🎨 Customization

### Change Ad Frequency
**File:** `AdManager.kt`
```kotlin
private const val INTERSTITIAL_INTERVAL = 3 // Change this number
```

### Change Calculator Colors
**File:** `ui/theme/Color.kt`
```kotlin
val CalculatorBackground = Color(0xFF121212) // Change hex color
```

### Add New Functions
1. Add to `TokenType` enum in `Tokenizer.kt`
2. Add parsing logic in `Parser.kt`
3. Add evaluation logic in `Evaluator.kt`
4. Add button in `CalculatorScreen.kt`

## 🐛 Troubleshooting

### Gradle Sync Fails
```bash
# Clean and rebuild
./gradlew clean
./gradlew --refresh-dependencies
```

### App Crashes on Launch
- Check logcat for errors
- Ensure `google-services.json` is present (if using Firebase)
- Verify AdMob App ID in manifest

### Ads Not Showing
- Check internet permission in manifest
- Verify AdMob App ID is correct
- Wait 24-48 hours after AdMob approval
- Check AdMob dashboard for ad unit status

### Build Errors
```bash
# Update Gradle wrapper
./gradlew wrapper --gradle-version 8.7

# Clean build
./gradlew clean build
```

## 📊 Project Stats

- **Language:** Kotlin 100%
- **UI Framework:** Jetpack Compose
- **Architecture:** MVVM (Model-View-ViewModel)
- **Min SDK:** 24 (Android 7.0)
- **Target SDK:** 35 (Android 15)
- **Dependencies:** 15+
- **Test Coverage:** 25+ unit tests

## 🎯 Next Steps

1. ✅ Build and run the app
2. ✅ Test all calculator functions
3. ✅ Verify bracket matching works
4. ✅ Test ad display (if configured)
5. ✅ Customize colors/theme
6. ✅ Add more features (graphing, history export, etc.)
7. ✅ Publish to Google Play Store

## 📚 Resources

- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)
- [Jetpack Compose Tutorial](https://developer.android.com/jetpack/compose/tutorial)
- [AdMob Android Guide](https://developers.google.com/admob/android/quick-start)
- [Material Design 3](https://m3.material.io/)

## 💡 Tips

- Use Android Studio's Layout Inspector to debug Compose UI
- Enable "Show Layout Bounds" in Developer Options
- Use Android Profiler to monitor performance
- Test on multiple screen sizes
- Check accessibility with TalkBack enabled

---

**Happy Coding! 🎉**
