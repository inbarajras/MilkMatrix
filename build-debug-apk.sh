#!/bin/bash

# MilkMatrix APK Builder
# This script creates a debug APK with Kotlin issue fixes

echo "🚀 MilkMatrix APK Builder"
echo "======================="

# Step 1: Update the gradle.properties file with compatible Kotlin version
echo "📝 Updating Gradle properties..."
if [ -f "android/gradle.properties" ]; then
  # Check if kotlinVersion is already set
  if ! grep -q "kotlinVersion=" android/gradle.properties; then
    echo "" >> android/gradle.properties
    echo "# Set correct Kotlin version for compatibility" >> android/gradle.properties
    echo "kotlinVersion=1.6.10" >> android/gradle.properties
  else
    # Update existing kotlinVersion
    sed -i '' 's/kotlinVersion=.*/kotlinVersion=1.6.10/g' android/gradle.properties
  fi
  echo "✅ Gradle properties updated."
else
  echo "❌ android/gradle.properties not found."
fi

# Step 2: Create a simple build profile that avoids Kotlin version issues
echo "📝 Creating simplified build profile..."
cat > eas-build-debug.json << 'EOL'
{
  "cli": {
    "version": ">= 0.53.0"
  },
  "build": {
    "debug": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug",
        "withoutCredentials": true,
        "distribution": "internal",
        "image": "ubuntu-22.04-jdk-17-ndk-r21e",
        "env": {
          "EXPO_NO_KOTLIN_VERSION_CHECK": "1"
        }
      }
    }
  }
}
EOL
echo "✅ Build profile created."

# Step 3: Run the build
echo "🏗️  Starting APK build..."
echo ""
echo "This will create a debug APK that avoids the Kotlin version issues."
echo "The build might take a few minutes to complete."
echo ""

# Set environment variables to help with Kotlin issues
export EXPO_NO_KOTLIN_VERSION_CHECK=1

# Run the build using the debug profile
eas build --platform android --profile debug --config eas-build-debug.json --non-interactive

echo ""
echo "✅ Build process initiated!"
echo ""
echo "Monitor progress on the Expo website."
echo "After the build completes, you'll receive an email and can download the APK for testing."
