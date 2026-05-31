# Tuk Talk Thai — Mobile App Store Launch Checklist

_For the owner. Last updated: May 30, 2026. This is the foundation checklist; the
app is NOT being submitted in this task. Status reflects what the Capacitor
foundation already provides vs. what is still an owner/tooling action._

Legend: ✅ done · 🟡 partial / needs assets · ⬜ owner action · 🔧 needs macOS/SDK tooling

## Accounts & identifiers
| Item | Status | Notes |
| --- | --- | --- |
| Apple Developer account | ⬜ | Required for iOS build, TestFlight, App Store. $99/yr. Needed before any iOS device build. |
| Google Play Developer account | ⬜ | $25 one-time. Needed for Play internal testing + release. |
| App ID / bundle id | ✅ | `com.tuktalkthai.app` (set in `capacitor.config.json`; Android `applicationId` + `namespace` confirmed). Use the same for the iOS bundle id. |
| App name | ✅ | `Tuk Talk Thai` (Android `app_name` confirmed; reuse for iOS display name + store listing). |

## Brand assets
| Item | Status | Notes |
| --- | --- | --- |
| App icon (store) | 🟡 | Android project currently has the **default Capacitor launcher icon**. Provide branded adaptive icon (Android: 432×432 foreground + background; iOS: 1024×1024). Web favicons/PWA icons exist (`public/pwa-*.png`, `apple-touch-icon.png`) and can seed the design. |
| Splash screen | 🟡 | Default Capacitor splash images are generated (`android/app/src/main/res/drawable*/splash.png`). Replace with branded splash; config already sets `#0F3D2E` background, 1200ms, no spinner. |
| Screenshots | ⬜ | Needed per store: iPhone 6.7"/6.5", iPad, and Android phone/tablet. Capture from real device builds (Learn path, a mini-unit, sentence builder, Challenge, Course Complete). |
| Feature graphic (Play) | ⬜ | 1024×500 PNG/JPG for the Play listing. |

## Legal / required URLs (already live on the web)
| Item | Status | URL |
| --- | --- | --- |
| Privacy policy URL | ✅ | `https://www.tuktalkthai.com/privacy` |
| Terms URL | ✅ | `https://www.tuktalkthai.com/terms` |
| Support URL | ✅ | `https://www.tuktalkthai.com/support` (mailto `support@tuktalkthai.com`) |
| Account deletion URL | ✅ | `https://www.tuktalkthai.com/delete-account` (required by both stores) |

## Store listing content
| Item | Status | Notes |
| --- | --- | --- |
| App category | ⬜ | Suggest **Education** (primary). |
| App description | 🟡 | Seed from manifest: "Real Thai for real life in Thailand. Speak from day one." Expand to a full store description (features: 8 guided stages, 96 mini-units, sentence builders, spaced review, challenges, streaks). |
| Keywords (iOS) | ⬜ | e.g. learn Thai, Thai language, speak Thai, Thai phrases, Thailand, expat, travel Thai. |
| Test account | ⬜ | Provide reviewer credentials (email confirmation is on — give a pre-confirmed account or document the flow). Required for review. |
| Data safety form (Play) | ⬜ | Declare: account email, learning progress, optional push token (OneSignal). No ads, no third-party sale. |
| App privacy (App Store) | ⬜ | Same disclosures mapped to Apple's nutrition labels (data linked to identity: email; usage data). |
| Content rating | ⬜ | Expected 4+/Everyone (educational, no objectionable content). Complete the IARC/Apple questionnaire. |
| Payments disclosure | ✅ | No active purchases — Super is "coming soon" with no checkout. Do not enable IAP metadata until real billing exists (avoid store rejection for non-functional purchases). |

## Build & technical readiness
| Item | Status | Notes |
| --- | --- | --- |
| Capacitor configured | ✅ | `capacitor.config.json` (appId, appName, webDir=dist, splash, status bar). |
| Web build → `dist` | ✅ | `npm run build` passes; `npx cap sync` copies `dist` into native projects. |
| Android project scaffolded | ✅ | `android/` committed (source only; build artifacts gitignored). |
| Android build (APK/AAB) | ✅ debug | **Debug APK builds on this machine (May 31, 2026), headlessly — no Android Studio.** Toolchain installed via official downloads: Microsoft OpenJDK **21** (Capacitor 8 needs JDK 21, NOT 17) + Android cmdline-tools + SDK 36. `gradle assembleDebug` → `android\app\build\outputs\apk\debug\app-debug.apk` (~5.94 MB). Release/signed AAB still an owner action. |
| iOS project | 🔧 | **Requires macOS + Xcode** (cannot be generated on Windows). On a Mac: `npx cap add ios` then `npx cap open ios`. |
| Deep links / auth | ⬜ | See `docs/mobile-auth-notes.md` — needed before mobile sign-in/confirm works. |
| Native push | ⬜ | See `docs/mobile-push-notes.md` — APNs/FCM + OneSignal native plugin. |

## Android build environment setup (DONE — headless, May 31, 2026)

**The toolchain is installed and the debug APK builds — without Android Studio.**
No package manager was available (`winget`/`choco`/`scoop` all absent), so each
tool was fetched from its official source and unpacked under the user profile.

> ⚠️ **Capacitor 8 requires JDK 21, not JDK 17.** The Capacitor-generated Gradle
> files pin `JavaVersion.VERSION_21` (`android/app/capacitor.build.gradle`,
> `capacitor-cordova-android-plugins/build.gradle`, `@capacitor/android`). A JDK 17
> build reaches `:capacitor-android:compileDebugJavaWithJavac` then fails with
> `error: invalid source release: 21`. JDK 17 was installed first (per the old
> note) and proved insufficient; **JDK 21 is the working requirement.**

| Tool | Status | Detail |
| --- | --- | --- |
| Microsoft OpenJDK **21** | ✅ | `21.0.11` LTS from `https://aka.ms/download-jdk/...`, at `C:\Users\bdstd\toolchain\jdk-21.0.11+10`. `java`/`javac` → 21.0.11. (The pre-existing Java 8 JRE and a JDK 17 install were left in place, untouched.) |
| Android cmdline-tools | ✅ | Official Google `commandlinetools-win` from `https://dl.google.com/...`, at `…\Android\Sdk\cmdline-tools\latest` (`sdkmanager` v12.0). |
| `platform-tools` (adb) | ✅ | `adb` 1.0.41 (37.0.0) at `…\Android\Sdk\platform-tools\adb.exe`. |
| `platforms;android-36` + `build-tools;36.0.0` (+ `build-tools;35.0.0`) | ✅ | Matches project `compileSdk`/`targetSdk` = 36 (`android/variables.gradle`); AGP pulled build-tools 35 too. |
| Gradle 8.14.3 | ✅ | The wrapper download was flaky, so the full distribution was fetched from `https://services.gradle.org/distributions/gradle-8.14.3-bin.zip` and run directly from `C:\Users\bdstd\toolchain\gradle-8.14.3\bin\gradle.bat`. |
| Android Studio | ⬜ Not needed | Deliberately not installed. |

- **SDK:** `C:\Users\bdstd\AppData\Local\Android\Sdk`  ·  **JDK 21:** `C:\Users\bdstd\toolchain\jdk-21.0.11+10`
- `JAVA_HOME`/`ANDROID_HOME` are **not persisted** and the toolchain lives under
  the user profile (a Deep Freeze restore wipes it). Set them per shell (below) or
  persist once with `setx`.

### Build the debug APK (reproducible)

```
set JAVA_HOME=C:\Users\bdstd\toolchain\jdk-21.0.11+10
set ANDROID_HOME=C:\Users\bdstd\AppData\Local\Android\Sdk
set ANDROID_SDK_ROOT=%ANDROID_HOME%
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

set NODE_OPTIONS=--max-old-space-size=4096
npm.cmd run build
npx cap sync android
cd android
C:\Users\bdstd\toolchain\gradle-8.14.3\bin\gradle.bat assembleDebug --no-daemon
```

Output: `android\app\build\outputs\apk\debug\app-debug.apk` (~5.94 MB, gitignored —
do not commit). First build ~1.5 min with deps cached (longer cold). As of
May 31, 2026 no device/emulator was connected, so the APK was built but not
installed; install later with
`adb install -r android\app\build\outputs\apk\debug\app-debug.apk`.

<details><summary>Historical (pre-May 31): toolchain absent</summary>

Earlier this machine had only a Java 8 JRE, no JDK, no Android SDK, no `adb`,
`JAVA_HOME`/`ANDROID_HOME` unset, no Android Studio. The original note also
assumed JDK 17 — which is necessary but **not sufficient** for Capacitor 8.
</details>

**Conclusion:** The debug APK **cannot be built on this machine yet.** The Gradle
wrapper was intentionally **not run** (it would fail immediately on the Java
version and the missing SDK, and the first run would also try to download the
Gradle distribution). No app code was changed.

### Exact install steps to unblock (one-time)

1. **Install a JDK 17** (either option):
   - **Eclipse Temurin / Adoptium JDK 17** (MSI), or
   - **Android Studio** (recommended) — it bundles a compatible JDK (JBR) at
     `C:\Program Files\Android\Android Studio\jbr`.
   - Then set, for the build shell:
     - `JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17...` (or the Studio `jbr` path)
     - add `%JAVA_HOME%\bin` to `PATH`
   - Verify: `java -version` and `javac -version` both report **17.x**.

2. **Install the Android SDK** (easiest via **Android Studio → SDK Manager**), including:
   - **Android SDK Platform** (e.g. API 34/35 — match the project's `compileSdk`),
   - **Android SDK Build-Tools**,
   - **Android SDK Platform-Tools** (provides `adb`),
   - **Android Emulator** (only if you want an emulator vs. a physical device).
   - Set environment variables:
     - `ANDROID_HOME = C:\Users\bdstd\AppData\Local\Android\Sdk`
     - `ANDROID_SDK_ROOT = %ANDROID_HOME%`
     - add `%ANDROID_HOME%\platform-tools` to `PATH` (for `adb`).
   - Capacitor writes the SDK path to `android\local.properties` (gitignored) on
     first sync/open; or create it with `sdk.dir=C:\\Users\\bdstd\\AppData\\Local\\Android\\Sdk`.

3. **Build the debug APK** (from repo root):
   ```
   set NODE_OPTIONS=--max-old-space-size=4096
   npm.cmd run build
   npx cap sync android
   cd android
   gradlew.bat assembleDebug
   ```
   Expected output APK: `android\app\build\outputs\apk\debug\app-debug.apk`
   (a build artifact — **do not commit**; it is gitignored).

4. **Install / run on a device** (USB debugging on, or an emulator running):
   ```
   adb devices
   adb install -r android\app\build\outputs\apk\debug\app-debug.apk
   ```
   or `npx cap run android --target <device-id>`.

> Easiest path overall: install **Android Studio**, open the `android/` folder, let
> it provision the SDK + JBR, then Run ▶ to a device/emulator (no manual env vars).

## Beta testing path
| Item | Status | Notes |
| --- | --- | --- |
| iOS TestFlight | ⬜ | After first signed iOS build; internal then external testers. |
| Play internal testing | ⬜ | Upload first AAB to the internal track; closed testing before production. |

## Real-device QA checklist (run on first device builds)
- [ ] App launches; splash → app with no white flash; status bar legible over the dark header.
- [ ] Safe areas: bottom nav not clipped by the home indicator; notch/Dynamic Island clear (web already uses `viewport-fit=cover` + `env(safe-area-inset-bottom)`).
- [ ] No horizontal overflow on small phones; modals/celebration overlay fit and are dismissible.
- [ ] Sentence-builder tiles are comfortable tap targets; drag/tap works on touch.
- [ ] Audio / TTS: cards speak (verify iOS WKWebView SpeechSynthesis + Android WebView TTS; quality/voice availability varies).
- [ ] Sign-up → email confirm → signed-in (requires deep-link work; see auth notes).
- [ ] Progress (XP, streak, completed mini-units) persists across app restarts.
- [ ] Course Complete celebration fires once on real device (and not again after restart).
- [ ] Legal/support/delete-account pages open and are readable.
- [ ] Push permission prompt + delivery (after native push wiring).
- [ ] Back button (Android) behaves (no accidental app exit mid-lesson) — wire `@capacitor/app` back-button handling if needed.
