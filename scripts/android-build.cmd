@echo off
REM ============================================================================
REM  Tuk Talk Thai - headless Android debug APK build helper (Windows)
REM ----------------------------------------------------------------------------
REM  Builds android\app\build\outputs\apk\debug\app-debug.apk without Android
REM  Studio. Sets up the command-line toolchain env, runs the web build +
REM  Capacitor sync, then `gradle assembleDebug`.
REM
REM  Requirements (install once; see docs/mobile-app-launch-checklist.md):
REM    - JDK 21  (Capacitor 8 needs JDK 21, NOT 17)
REM    - Android SDK: platforms;android-36 + build-tools;36.0.0 + platform-tools
REM    - Gradle 8.14.3 (the repo wrapper, or a local dist)
REM
REM  Override any path by setting the env var before calling this script, e.g.:
REM    set JAVA_HOME=D:\jdk-21  &&  scripts\android-build.cmd
REM
REM  This script touches NO product code, Thai content, Supabase, or secrets.
REM  The APK it produces is a gitignored build artifact - do not commit it.
REM ============================================================================
setlocal enableextensions enabledelayedexpansion

REM --- repo root = parent of this script's folder ---------------------------
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%.." || (echo [ERR] cannot cd to repo root & exit /b 1)
set "REPO=%CD%"

REM --- JAVA_HOME: honor existing if it looks like JDK 21, else auto-detect ----
if defined JAVA_HOME if exist "%JAVA_HOME%\bin\javac.exe" goto :have_java
set "JAVA_HOME="
for /d %%D in ("%USERPROFILE%\toolchain\jdk-21*") do set "JAVA_HOME=%%~fD"
if not defined JAVA_HOME (
  echo [ERR] JDK 21 not found under "%USERPROFILE%\toolchain\jdk-21*".
  echo       Set JAVA_HOME to a JDK 21 install and re-run.
  popd & exit /b 1
)
:have_java

REM --- ANDROID_HOME: honor existing, else default user-profile SDK -----------
if not defined ANDROID_HOME set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not defined ANDROID_SDK_ROOT set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
  echo [ERR] Android SDK platform-tools not found at "%ANDROID_HOME%".
  echo       Install the SDK ^(see docs/mobile-app-launch-checklist.md^) and re-run.
  popd & exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

REM --- pick a Gradle: local dist first (wrapper download is flaky here) -------
set "GRADLE="
if exist "%USERPROFILE%\toolchain\gradle-8.14.3\bin\gradle.bat" set "GRADLE=%USERPROFILE%\toolchain\gradle-8.14.3\bin\gradle.bat"

echo ============================================================
echo  JAVA_HOME    = %JAVA_HOME%
echo  ANDROID_HOME = %ANDROID_HOME%
if defined GRADLE (echo  GRADLE       = %GRADLE%) else (echo  GRADLE       = android\gradlew.bat ^(wrapper^))
echo ============================================================

REM --- web build -------------------------------------------------------------
set "NODE_OPTIONS=--max-old-space-size=4096"
echo [1/3] npm run build
call npm.cmd run build || (echo [ERR] web build failed & popd & exit /b 1)

REM --- capacitor sync --------------------------------------------------------
echo [2/3] npx cap sync android
call npx.cmd cap sync android || (echo [ERR] cap sync failed & popd & exit /b 1)

REM --- assemble debug APK ----------------------------------------------------
echo [3/3] gradle assembleDebug
pushd "%REPO%\android" || (echo [ERR] no android\ dir & popd & exit /b 1)
if defined GRADLE (
  call "%GRADLE%" assembleDebug --no-daemon --console=plain
) else (
  call gradlew.bat assembleDebug --no-daemon --console=plain
)
set "RC=%ERRORLEVEL%"
popd
popd

set "APK=%REPO%\android\app\build\outputs\apk\debug\app-debug.apk"
if "%RC%"=="0" if exist "%APK%" (
  echo.
  echo [OK] Debug APK built:
  echo      %APK%
  echo      Install on a connected device with:
  echo        adb install -r "%APK%"
  exit /b 0
)
echo [ERR] Build failed ^(gradle exit %RC%^). See output above.
exit /b 1
