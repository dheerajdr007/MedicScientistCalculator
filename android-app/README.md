# Scientific Calculator - Android App

A full-featured scientific calculator Android app built with **Kotlin** and **Jetpack Compose**, featuring the same modular architecture as the C version (Tokenizer → Parser → AST → Evaluator) with real-time bracket matching visualization and AdMob integration.

## 📱 Features

### Calculator Features
- ✅ Full scientific functions: sin, cos, tan, asin, acos, atan, log, ln, sqrt, abs
- ✅ Constants: π (pi), e (Euler's number)
- ✅ Operators: +, -, ×, ÷, ^, !
- ✅ Parentheses with unlimited nesting
- ✅ Order of operations (PEMDAS/BODMAS)
- ✅ Right-associative exponentiation

### UI Features
- 🎨 **Color-coded bracket matching**:
  - 🟢 Green = Matched/Balanced brackets
  - 🔴 Red = Unclosed brackets (need ')')
  - 🟠 Orange = Extra brackets (no matching '(')
- 📊 **Step-by-step calculation display**
- 👁️ **Live result preview** as you type
- 📜 **Calculation history** (click to reuse)
- ⌨️ **Smart backspace** (removes entire function names)
- 🔢 **Auto-close brackets** button

### AdMob Integration
- 📢 **Banner ads** (top and bottom)
- 🎯 **Interstitial ads** (every 3 calculations)
- 📱 **Native inline ads** (app-style)
- ⚙️ **Configurable timing**

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Input Expression                    │
│          "sin(pi/4) + sqrt(2)"                   │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              Tokenizer.kt                        │
│  Converts string → Token stream                  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│               Parser.kt                          │
│  Recursive descent → AST                         │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│          Abstract Syntax Tree (AST)              │
│     Sealed class hierarchy (Kotlin idiomatic)    │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              Evaluator.kt                        │
│  Walks AST → computes result                     │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                 Result                           │
│              2.1213203436                        │
└─────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
android-app/
├── app/
│   ├── build.gradle.kts              # App-level Gradle config
│   ├── proguard-rules.pro            # ProGuard rules
│   └── src/main/
│       ├── AndroidManifest.xml       # App manifest
│       ├── java/com/medicscientist/calculator/
│       │   ├── MainActivity.kt       # Entry point + AdMob banners
│       │   ├── calculator/
│       │   │   ├── Tokenizer.kt      # Lexical analysis
│       │   │   ├── Parser.kt         # Syntax analysis (AST builder)
│       │   │   ├── Evaluator.kt      # AST evaluation
│       │   │   └── CalculatorEngine.kt # Main coordinator
│       │   ├── ads/
│       │   │   └── AdManager.kt      # AdMob integration
│       │   └── ui/
│       │       ├── theme/
│       │       │   ├── Color.kt      # Color definitions
│       │       │   ├── Theme.kt      # Material3 theme
│       │       │   └── Type.kt       # Typography
│       │       └── screens/
│       │           └── CalculatorScreen.kt # Main UI
│       └── res/
│           ├── values/
│           │   ├── strings.xml
│           │   ├── colors.xml
│           │   └── themes.xml
│           ├── xml/
│           │   ├── backup_rules.xml
│           │   └── data_extraction_rules.xml
│           └── mipmap-anydpi-v26/
│               ├── ic_launcher.xml
│               └── ic_launcher_round.xml
├── build.gradle.kts                  # Project-level Gradle config
├── settings.gradle.kts               # Project settings
├── gradle.properties                 # Gradle properties
└── gradle/
    └── libs.versions.toml            # Version catalog
```

## 🔧 Setup Instructions

### 1. Open in Android Studio
```bash
# Open the android-app directory in Android Studio
# File → Open → Select "android-app" folder
```

### 2. Sync Gradle
Android Studio will automatically sync Gradle. Wait for it to complete.

### 3. Configure AdMob (Optional)
Replace test ad IDs with your real AdMob IDs:

**In `AdManager.kt`:**
```kotlin
private const val BANNER_AD_UNIT_ID = "ca-app-pub-YOUR_ID/YOUR_SLOT"
private const val INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-YOUR_ID/YOUR_SLOT"
```

**In `AndroidManifest.xml`:**
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
```

### 4. Build & Run
```bash
# From Android Studio: Run → Run 'app'
# Or from command line:
./gradlew assembleDebug
```

## 🎮 Usage

### Basic Operations
```
2 + 3 × 4 = 14
(2 + 3) × 4 = 20
2 ^ 3 ^ 2 = 512  (right-associative)
5! = 120
```

### Scientific Functions
```
sin(pi/2) = 1
cos(pi) = -1
sqrt(144) = 12
log(1000) = 3
ln(e) = 1
```

### Complex Expressions
```
sin(pi/4)^2 + cos(pi/4)^2 = 1
sqrt(3^2 + 4^2) = 5
log(10^5) = 5
```

## 🎨 Bracket Matching

The calculator provides real-time visual feedback for bracket matching:

- **Green brackets** `( )` = Properly matched
- **Red bracket** `(` = Unclosed (needs closing `)`)
- **Orange bracket** `)` = Extra (no matching open)
- **Visual stack** = Shows count of unclosed brackets

### Status Bar
Shows: `( 2 opened | ) 1 closed | ⚠ Need 1 more )`

## 📢 AdMob Integration

### Ad Types
1. **Banner Ads**: Top and bottom of screen (320x50)
2. **Interstitial Ads**: Full-screen, shown every 3 calculations
3. **Native Ads**: Inline app-style ads

### Configuration
```kotlin
// In AdManager.kt
private const val INTERSTITIAL_INTERVAL = 3 // Show every N calculations
```

### Test Ads
The app uses Google's test ad IDs by default. Replace with your real IDs for production.

## 🧪 Testing

### Unit Tests
```bash
./gradlew test
```

### Instrumented Tests
```bash
./gradlew connectedAndroidTest
```

## 📦 Building Release APK

```bash
./gradlew assembleRelease
```

The APK will be in `app/build/outputs/apk/release/`

## 🔒 ProGuard

ProGuard rules are configured in `proguard-rules.pro` to keep AdMob and calculator engine classes.

## 📋 Requirements

- **Minimum SDK**: 24 (Android 7.0)
- **Target SDK**: 35 (Android 15)
- **Kotlin**: 2.1.0
- **Compose**: BOM 2024.12.01
- **Java**: 11

## 🐛 Known Issues

None at the moment. Please report issues on GitHub.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Built with ❤️ using Kotlin + Jetpack Compose**
