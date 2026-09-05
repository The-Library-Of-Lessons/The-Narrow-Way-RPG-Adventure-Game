# The Narrow Way for Android

Offline Android wrapper for the browser game, Android 7.0 (API 24) or newer. The build bundles the current game files from the repository root. No Internet or broad storage permission is requested. Scripture links open in the phone's browser.

Landscape orientation keeps both touch controls and the map visible. Saves stay in WebView storage. The pause menu's export/import buttons use Android's document picker; export your website save and import it here to continue. Uninstalling the app clears its internal save.

## Build

GitHub Actions: open Actions > Build Android APK. Each relevant push to main creates a signed test APK under the run's artifacts. Download and extract the artifact ZIP, then install The-Narrow-Way-0.1.0.apk on your phone.

Local build: install JDK 17, Android SDK 35, and Gradle 8.11.1. Set ANDROID_HOME to the SDK folder, then run `gradle -p android :app:assembleDebug :app:lintDebug` from the repository root. Output: android/app/build/outputs/apk/debug/app-debug.apk.

This initial APK is debug-signed for personal testing, not a Play Store release. CI generates a debug signing key; a later build may have a different key and require uninstalling the old APK first. Export your save before uninstalling. Establish a private permanent release key and increment versionCode before distributing upgradeable releases. Never commit private signing keys.

Original game and wrapper source use the repository MIT license. AndroidX WebKit and its dependencies retain their own licenses. The source's ASSET-LICENSE.md and SCRIPTURE-SOURCES.md document other attribution and scope.
