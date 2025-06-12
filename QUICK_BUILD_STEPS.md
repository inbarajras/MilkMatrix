# Step-by-Step Production Build Instructions

Follow these steps to create a production build for Google Play Store:

## 1. Prerequisites Setup

First, ensure you have the correct CLI tools:

```bash
# Remove old expo-cli if installed
npm uninstall -g expo-cli

# Install the new Expo CLI
npm install -g @expo/cli@latest

# Install EAS CLI
npm install -g eas-cli@latest

# Verify installations
npx expo --version
eas --version
```

## 2. Login to Expo

```bash
cd /Applications/MilkMatrix
eas login
```

Enter your Expo account credentials when prompted.

## 3. Initialize EAS Project

```bash
# Configure the project for EAS Build
# This will generate a proper UUID for your project and update app.json
eas build:configure

# If prompted, select:
# - Generate a new project ID
# - Update app.json with the new project ID
```

**Note**: The projectId will be automatically generated and added to your `app.json` file.

## 4. Generate Android Keystore

```bash
# Setup Android credentials
eas credentials
```

Select:
- Platform: Android
- Profile: production
- Generate new keystore (if this is your first build)

**Important**: Save the keystore details securely!

## 5. Build Production AAB

```bash
# Build Android App Bundle for Play Store
eas build --platform android --profile production
```

This will:
- Upload your code to Expo's build servers
- Build a signed AAB file
- Provide a download link when complete

## 6. Monitor Build Progress

- Check progress at: https://expo.dev/accounts/[your-username]/projects/milk-matrix/builds
- You'll receive email notifications
- Build typically takes 10-15 minutes

## 7. Download and Upload to Play Store

1. Download the `.aab` file from the build dashboard
2. Go to Google Play Console
3. Upload the AAB to your app release

---

## Alternative: Local Build (if EAS fails)

If EAS Build doesn't work, you can try a local build:

```bash
# Install Android SDK and tools first
# Then run:
npx expo run:android --variant release
```

## Troubleshooting Commands

```bash
# Clear EAS cache
eas credentials --clear-cache

# Reset EAS configuration
eas init

# Check project status
eas project:info

# View build logs
eas build:list
```

### Common Errors and Solutions

**"Invalid UUID appId" Error:**
- This means the projectId in app.json is not a valid UUID
- Solution: Remove the projectId from app.json and run `eas build:configure` to generate a new one

**"Project not found" Error:**
- Run `eas init` to create a new project
- Or run `eas build:configure` to link existing project

**"Android Gradle plugin requires Java 17" Error:**
- The build is using Java 11 but requires Java 17
- Solution: Update the `image` parameter in eas.json to use JDK 17:
  ```json
  "image": "ubuntu-22.04-jdk-17-ndk-r21e"
  ```
- The eas.json file has already been updated with this change

**"Key 1.8.10 is missing in the map" Error:**
- This is a Kotlin version compatibility issue with Expo builds
- Solutions:
  1. Try the simplified APK build first: `eas build --platform android --profile basic-apk`
  2. Change Kotlin version to 1.6.21 in android/gradle.properties
  3. Remove kotlinVersion from app.json Android section

## Quick Commands Summary

```bash
# One-time setup
eas login
eas build:configure
eas credentials

# Build commands
eas build --platform android --profile basic-apk   # Simple APK without credentials (fastest)
eas build --platform android --profile preview     # APK for testing
eas build --platform android --profile production  # AAB for Play Store

# Submit to Play Store (optional)
eas submit --platform android
```
