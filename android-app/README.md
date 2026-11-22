# Keralaravam for Android

This folder packages the web app as an Android app with [Capacitor](https://capacitorjs.com). The web files (`index.html`, `sw.js`, the manifest, `icons/`, `vendor/` and `audio/`) are copied into the app, so it runs offline from the first launch and does not need GitHub Pages.

App name **Keralaravam**, package `com.sskblum.keralaravam` (change `appId` in `capacitor.config.json` before you publish, and the `namespace` / `applicationId` in `android/app/build.gradle` to match), version 2.0 (code 2).

## One-time setup on your computer

1. **Node.js** 20 or newer (you have it).
2. **A full JDK**, version 21 or newer, that includes `javac`. On Fedora: `sudo dnf install java-21-openjdk-devel` (or `java-25-openjdk-devel`). The JDK on this machine is the headless runtime only, so the build stops with "does not provide the required capabilities: [JAVA_COMPILER]".
3. **Android SDK** with platform 36 and build-tools 35 or newer (Android Studio installs these). This machine has it in `~/Android/Sdk`. Tell the build where it is: `export ANDROID_HOME=$HOME/Android/Sdk` (or put `sdk.dir=/path/to/Sdk` in `android/local.properties`).
4. Run `npm install` in this folder.

## Build a debug APK (for testing on a phone)

From the repository root, make sure `index.html` is up to date and `audio/` holds the MP3s (copy them from `audio_backup/` if it is empty):

```bash
python3 dev/build.py
cd android-app
npm run apk
```

The file is written to `android-app/dist/keralaravam-debug.apk`. Copy it to the phone and open it (allow installs from unknown sources), or run `adb install android-app/dist/keralaravam-debug.apk`.

`npm run apk` copies the web app into `www/`, runs `cap sync`, then builds with the Gradle wrapper. To only refresh the web files, use `npm run sync`.

## Build a release APK or Play Store bundle

1. Create a signing key once and keep it safe (you need the same key for every update):
   ```bash
   keytool -genkeypair -v -keystore keralaravam.keystore -alias keralaravam -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Create `android/keystore.properties` (it is ignored by git):
   ```
   storeFile=../keralaravam.keystore
   storePassword=YOUR_PASSWORD
   keyAlias=keralaravam
   keyPassword=YOUR_PASSWORD
   ```
3. `npm run release` builds `dist/keralaravam-release.apk`. For the Play Store, build an app bundle instead: `cd android && ./gradlew bundleRelease` (output in `android/app/build/outputs/bundle/release/`).

Before each new release, raise `versionCode` (and `versionName`) in `android/app/build.gradle`.

## What is set up

- **Icons and splash screen** are generated from `icons/maskable-512.png` by `python3 scripts/make-icons.py` (needs Pillow).
- **Permissions:** internet, microphone (live recording), keep-awake and audio settings.
- **Web address inside the app:** `https://keralaravam.app` (a local address, not a real site), so the service worker, IndexedDB and Web Audio work, and YouTube sees a normal HTTPS page.
- **Gradle 9.1** is used (the wrapper in `android/gradle/wrapper`) so the build also runs on newer JDKs.

## Things to test on a real phone

- **YouTube videos, Original (YouTube audio) and ambience originals:** the embedded player may refuse to play inside an app WebView ("video player configuration error"). If it does, the fix is to load the player from a real hosted page. Please test this first.
- **Playing with the screen off:** Android may pause the web view in the background, so melam audio can stop when the app is minimised. Keeping the screen on works. A background audio service would be a later addition.
- **Microphone:** the first time you record, Android asks for permission.
- **Size:** about 13 MB of audio is inside the app.

`www/`, `node_modules/`, `dist/` and `android/local.properties` are generated and ignored by git.
