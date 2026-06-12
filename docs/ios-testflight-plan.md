# iOS Testing Plan (Capacitor, no Flutter)

Date: June 12, 2026
Status: ios/ Capacitor platform scaffolded and committed. **No signed iOS build
exists yet**; TestFlight is NOT ready until the signing steps below run on a
Mac (physical or CI). Nothing in this plan requires rewriting the app.

## The honest Windows/macOS split

| Step | Windows (this machine) | macOS required |
| --- | --- | --- |
| Web build (`npm run build`) | Yes | also works |
| iOS platform scaffold (`npx cap add ios`) | Done (Capacitor 8 uses Swift Package Manager, no CocoaPods needed to scaffold) | n/a |
| Sync web assets into ios/ (`npx cap sync ios`) | Yes (copy works; no pod step in Capacitor 8) | also works |
| Compile/run in Simulator | **No** | Xcode |
| Sign an IPA | **No** | Xcode + Apple certificates |
| Upload to TestFlight | **No** | Xcode Organizer / Transporter / `xcrun altool`-successor (`notarytool`/App Store Connect API) |

A signed iOS IPA **cannot** be produced on Windows. Flutter would not change
this; Apple's toolchain requirement is identical for every framework.

## Current iOS readiness

- `ios/` exists (Capacitor 8.3.4, Swift Package Manager based).
- Bundle id: `com.tuktalkthai.app` (same as Android). Display name: Tuk Talk Thai.
- Deployment target: iOS 15.0. Marketing version 1.0.
- All 7 plugins registered for iOS (app, browser, haptics, preferences,
  splash-screen, status-bar, community text-to-speech). None require an
  Info.plist permission string (no camera/mic/location; TTS uses the system
  speech synthesizer).
- App icon and splash are the default Capacitor placeholders, same situation as
  Android: replace with branded art before any store submission (owner action;
  a 1024x1024 master icon is enough, generate the set with an icon tool).
- Status bar/safe areas: the web app already uses `viewport-fit=cover` +
  `env(safe-area-inset-*)`, and `src/lib/native.js` guards the Android-only
  status-bar calls, so the notch should be handled; verify on device.
- Service worker/PWA code is harmless inside the native shell (`capacitor://`
  WebView has no service worker support and the registration is guarded), as
  already proven in the Android APK.
- Web push (OneSignal) does NOT work inside a native iOS WebView. Native push
  would need the OneSignal iOS SDK + APNs setup later; for the first TestFlight
  build, notifications are simply absent (the UI treats it as unsupported).
- Auth deep links: like Android, email confirm/reset links will not return into
  the app shell until deep links + Supabase redirect URLs are configured (see
  docs/mobile-auth-notes.md). Test accounts that are already confirmed work.

### Windows regeneration quirk (important)

`npx cap sync ios` rewrites `ios/App/CapApp-SPM/Package.swift` with
OS-native path separators. On Windows that produces BACKSLASH paths that break
Swift Package Manager on the Mac. The committed file uses forward slashes. If
you run `cap sync ios` on Windows again and the only Package.swift diff is
backslashes, restore it before committing:

```
git checkout -- ios/App/CapApp-SPM/Package.swift
```

On the Mac, `npx cap sync ios` regenerates it correctly (forward slashes).

## Option A: physical Mac with Xcode (recommended when a Mac is available)

One-time: install Xcode from the App Store, sign into Xcode with the Apple
Developer account (Settings > Accounts).

```
git clone https://github.com/ahmedmagdy1987/thai-fluency.git
cd thai-fluency
# create .env.local with the three public frontend values (see .env.example)
npm ci
npm run build
npx cap sync ios
npx cap open ios        # opens ios/App in Xcode
```

In Xcode: select the App target > Signing & Capabilities > set the Team
(automatic signing is fine for TestFlight) > pick Any iOS Device > Product >
Archive > Distribute App > TestFlight. First upload creates the build in App
Store Connect; add the owner as an internal tester.

Time estimate: 1-2 hours for the first run (mostly Apple account plumbing).

## Option B: cloud Mac (GitHub Actions macOS runner or rented Mac)

Use when no physical Mac is available. A GitHub Actions `macos-14` (or newer)
runner can build and upload. Required GitHub Actions **secrets** (names only,
NEVER commit values):

- `APPLE_CERTIFICATE_P12_BASE64` - Apple Distribution certificate, base64
- `APPLE_CERTIFICATE_PASSWORD` - password for the .p12
- `APPLE_PROVISIONING_PROFILE_BASE64` - App Store provisioning profile for
  `com.tuktalkthai.app` (or use automatic signing with the API key below)
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_P8_BASE64` - the .p8 private key, base64

Workflow shape (do NOT add until the secrets exist; this is documentation, not
a live workflow): checkout > setup-node > `npm ci` > `npm run build` >
`npx cap sync ios` > import certificate + profile into a temp keychain >
`xcodebuild -workspace ios/App/App.xcworkspace -scheme App archive` >
`xcodebuild -exportArchive` with an App Store export options plist > upload
with `xcrun altool`-successor (`xcrun notarytool` is for notarization;
TestFlight upload uses `xcrun altool --upload-app` replacement:
`xcrun altool` is deprecated, use `xcrun altool`'s replacement
`App Store Connect API` via fastlane `pilot` or `xcodebuild`/Transporter).
In practice the simplest reliable CI uploader is fastlane (`build_app` +
`upload_to_testflight`), which Capacitor's docs also recommend.

Rented-Mac alternative (MacStadium, MacinCloud, a friend's Mac): follow
Option A on it; nothing project-specific changes.

## Option C: PWA on iPhone Safari (owner can do this TODAY)

1. Open https://www.tuktalkthai.com in Safari on the iPhone.
2. Share button > Add to Home Screen > open from the home screen icon.
3. Test the first 10 minutes per docs/owner-beta-test-checklist.md.

Caveats vs native: audio uses Safari's speech synthesis (quality varies, and
iOS Safari requires a tap before audio, which the app already respects); no
push notifications unless enabled as Web Push (iOS 16.4+, home-screen PWAs
only); not an IPA, so it does not validate the native shell.

## Recommended path

1. **Now:** Option C (PWA) for the owner's visual/flow review - zero setup.
2. **For the real iOS beta:** Option A if any Mac is reachable, otherwise
   Option B with the six secrets above. Both end in TestFlight.

## Apple Developer / App Store Connect prerequisites (owner actions)

1. Apple Developer Program membership ($99/year) on the owner's Apple ID.
2. App Store Connect: create the app record with bundle id
   `com.tuktalkthai.app`, name "Tuk Talk Thai".
3. An Apple Distribution certificate (Xcode can create it automatically).
4. An App Store provisioning profile for the bundle id (automatic signing
   handles this in Option A).
5. For Option B only: an App Store Connect API key (Users and Access > Keys),
   stored ONLY as GitHub Actions secrets.
6. Branded 1024x1024 app icon approved (current icon is the Capacitor default).

## Risks and manual checklist for the first device build

- [ ] App launches to the landing page (no white screen) on a real iPhone.
- [ ] Status bar does not overlap the header; safe areas respected on a
      notched device, both orientations.
- [ ] Tap-to-hear audio works (iOS system TTS Thai voice; install a Thai voice
      under Settings > Accessibility > Spoken Content if missing).
- [ ] Sign-in with a confirmed test account works; remember the deep-link
      limitation for NEW signups inside the shell.
- [ ] Progress persists after killing and reopening the app.
- [ ] No payment/subscription UI claims anything active (Super is coming-soon).
- [ ] Notifications UI shows the unsupported/absent state gracefully.
- [ ] Keyboard does not cover inputs on small iPhones.
