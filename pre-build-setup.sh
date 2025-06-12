#!/bin/bash

# Pre-build validation and setup script
# This ensures all configurations are correct before building

set -e

echo "🔧 Pre-build validation and setup..."

# Check current directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# Validate Expo configuration
echo "📋 Validating EAS configuration..."
if ! npx eas config --non-interactive 2>/dev/null; then
    echo "❌ EAS configuration invalid"
    exit 1
fi

# Clean build artifacts completely
echo "🧹 Cleaning all build artifacts..."
rm -rf android/build
rm -rf android/app/build
rm -rf android/.gradle
rm -rf .gradle
rm -rf build

# Ensure correct permissions on gradlew
echo "🔑 Setting correct permissions..."
chmod +x android/gradlew

# Validate Android configuration
echo "🤖 Validating Android configuration..."
cd android
./gradlew clean --no-daemon --no-build-cache
cd ..

# Check for any remaining Kotlin version conflicts
echo "🔍 Checking for Kotlin version conflicts..."
if grep -r "1\.9\.22" android/ 2>/dev/null; then
    echo "⚠️  Warning: Found references to Kotlin 1.9.22, these may cause issues"
fi

echo "✅ Pre-build validation complete!"
echo "🚀 Ready for production build"
