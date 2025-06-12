#!/bin/bash

# Direct build script for MilkMatrix with Kotlin fixes
# This script will build a simple APK bypassing Kotlin issues

echo "🚀 Building MilkMatrix APK with compatibility fixes"
echo "=================================================="

# Create a temporary eas.json with simplified configuration
cat > /tmp/simple-build-eas.json << 'EOL'
{
  "cli": {
    "version": ">= 0.53.0"
  },
  "build": {
    "simple-apk": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug",
        "withoutCredentials": true,
        "distribution": "internal",
        "image": "ubuntu-22.04-jdk-17-ndk-r21e",
        "env": {
          "EXPO_NO_KOTLIN_VERSION_CHECK": "1",
          "KOTLIN_VERSION": "1.6.10"
        },
        "cache": {
          "disabled": true
        }
      }
    }
  }
}
EOL

# Make a backup of the current eas.json
cp eas.json eas.json.backup

# Use the simplified configuration
cp /tmp/simple-build-eas.json eas.json

echo "⚙️  Running build with simplified configuration..."
echo "This will create a debug APK that should build successfully"

# Set environment variables to help with Kotlin issues
export EXPO_NO_KOTLIN_VERSION_CHECK=1
export KOTLIN_VERSION=1.6.10

# Run the build
eas build --platform android --profile simple-apk --non-interactive

# Restore the original configuration
mv eas.json.backup eas.json

echo "✅ Build process started!"
echo ""
echo "Monitor the build progress on the Expo website."
echo "When complete, download the APK to test on your device."
