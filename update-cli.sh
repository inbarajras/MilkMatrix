#!/bin/bash

# Update EAS CLI and Expo CLI to the latest versions
echo "🚀 Updating EAS CLI and Expo CLI to latest versions..."

# Update EAS CLI
npm install -g eas-cli@latest

# Update Expo CLI
npm install -g @expo/cli@latest

# Show versions
echo "✅ Updated to the latest versions:"
echo "EAS CLI: $(eas --version)"
echo "Expo CLI: $(npx expo --version)"

echo ""
echo "🏗️ Ready to build! Use one of these commands:"
echo "For APK (testing): eas build --platform android --profile basic-apk"
echo "For AAB (Play Store): eas build --platform android --profile production"
