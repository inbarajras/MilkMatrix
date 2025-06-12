#!/bin/bash

# Quick fix script for common EAS build errors
echo "🔧 MilkMatrix Build Error Fixer"
echo "==============================="
echo "This script will attempt to fix common EAS build errors."
echo ""

# Check if app.config.js exists - if so, remove it as it might cause issues
if [ -f "app.config.js" ]; then
    echo "📝 Found app.config.js which can cause errors. Removing it..."
    mv app.config.js app.config.js.bak
    echo "✅ Renamed to app.config.js.bak"
fi

# Update EAS JSON to use Java 17
echo "📝 Updating eas.json to use Java 17..."
sed -i '' 's/ubuntu-22.04-jdk-11-ndk-r21e/ubuntu-22.04-jdk-17-ndk-r21e/g' eas.json
echo "✅ Updated image to use JDK 17"

# Check if any Kotlin version issues exist in app.json
echo "📝 Checking app.json for Kotlin version issues..."
if grep -q "kotlinVersion" app.json; then
    echo "Found kotlinVersion in app.json, removing it..."
    # This is a simplified approach - in a real script we'd use a JSON parser
    sed -i '' '/kotlinVersion/d' app.json
    echo "✅ Removed kotlinVersion from app.json"
fi

# Make sure newArchEnabled is set to false
echo "📝 Setting newArchEnabled to false in app.json..."
# Again, this is simplified - in a real script we'd use a JSON parser
if grep -q "newArchEnabled" app.json; then
    sed -i '' 's/"newArchEnabled": true,/"newArchEnabled": false,/g' app.json
    echo "✅ Set newArchEnabled to false"
fi

# Update gradle.properties
if [ -f "android/gradle.properties" ]; then
    echo "📝 Updating android/gradle.properties..."
    echo "kotlinVersion=1.8.10" >> android/gradle.properties
    echo "✅ Added explicit kotlinVersion to gradle.properties"
fi

echo ""
echo "🚀 Fixes applied! Now try building again with:"
echo "eas build --platform android --profile basic-apk"
echo ""
echo "If successful, you can then try the production build:"
echo "eas build --platform android --profile production"
