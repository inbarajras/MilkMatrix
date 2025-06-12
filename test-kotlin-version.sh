#!/bin/bash

# Simple test to determine the correct Kotlin version for Expo SDK 53

set -e

echo "🔍 Testing Kotlin version compatibility with Expo SDK 53..."

cd /Applications/MilkMatrix

# Clean everything first
echo "🧹 Cleaning build artifacts..."
rm -rf android/build
rm -rf android/app/build
rm -rf android/.gradle

# Test with no specific Kotlin version (let Expo decide)
echo "🧪 Testing with Expo's default Kotlin version..."

cd android
./gradlew clean --stacktrace 2>&1 | tee gradle-test.log

echo "📋 Build test completed. Check gradle-test.log for details."
