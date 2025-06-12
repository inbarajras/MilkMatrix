#!/bin/bash

# filepath: /Applications/MilkMatrix/production-build.sh
# MilkMatrix Production Build Script
# This script builds a release version of the MilkMatrix app with all required fixes

echo "🚀 MilkMatrix Production Build"
echo "============================"

# Set text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Ensure Android SDK is properly configured
echo -e "${YELLOW}🔍 Checking Android SDK configuration...${NC}"

# Set Android SDK path
export ANDROID_HOME=~/Library/Android/sdk
if [ -d "$ANDROID_HOME" ]; then
  echo -e "${GREEN}✅ Found Android SDK at: $ANDROID_HOME${NC}"
else
  echo -e "${RED}❌ Android SDK not found at $ANDROID_HOME${NC}"
  echo -e "${YELLOW}ℹ️ Please set the correct Android SDK path.${NC}"
  exit 1
fi

# Create or update local.properties
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
echo -e "${GREEN}✅ local.properties updated with SDK path${NC}"

# Step 2: Set up SDK licenses
echo -e "${YELLOW}📄 Setting up Android SDK licenses...${NC}"

# Create licenses directory if it doesn't exist
mkdir -p "$ANDROID_HOME/licenses"

# Create/update license files
echo "8933bad161af4178b1185d1a37fbf41ea5269c55" > "$ANDROID_HOME/licenses/android-sdk-license"
echo "d56f5187479451cdedfc0b45" > "$ANDROID_HOME/licenses/android-sdk-preview-license"
echo "8933bad161af4178b1185d1a37fbf41ea5269c55
d56f5187479451cdedfc0b45" > "$ANDROID_HOME/licenses/android-ndk-license"

echo -e "${GREEN}✅ Android SDK licenses set up${NC}"

# Step 3: Fix Kotlin version issues
echo -e "${YELLOW}🔧 Applying Kotlin version fixes...${NC}"

# Update gradle.properties
if [ -f "android/gradle.properties" ]; then
  # Check if kotlinVersion is already set
  if ! grep -q "kotlinVersion=" android/gradle.properties; then
    echo "" >> android/gradle.properties
    echo "# Explicitly set Kotlin version to stable version compatible with Expo modules" >> android/gradle.properties
    echo "kotlinVersion=1.5.31" >> android/gradle.properties
    echo "KOTLIN_VERSION=1.5.31" >> android/gradle.properties
  else
    # Update existing kotlinVersion
    sed -i '' 's/kotlinVersion=.*/kotlinVersion=1.5.31/g' android/gradle.properties
    sed -i '' 's/KOTLIN_VERSION=.*/KOTLIN_VERSION=1.5.31/g' android/gradle.properties
  fi
  
  # Add Kotlin version compatibility setting
  if ! grep -q "android.kotlin.version.compatibility=" android/gradle.properties; then
    echo "# Disable Kotlin version check to avoid build issues" >> android/gradle.properties
    echo "android.kotlin.version.compatibility=1.5.31" >> android/gradle.properties
  fi
  
  echo -e "${GREEN}✅ Kotlin version updated in gradle.properties${NC}"
else
  echo -e "${RED}❌ android/gradle.properties not found${NC}"
  exit 1
fi

# Step 4: Set environment variables for the build
echo -e "${YELLOW}🔧 Setting environment variables...${NC}"
export EXPO_NO_KOTLIN_VERSION_CHECK=1
export GRADLE_OPTS="-Dorg.gradle.project.kotlinVersion=1.5.31"
echo -e "${GREEN}✅ Environment variables set${NC}"

# Step 5: Clean the project before building
echo -e "${YELLOW}🧹 Cleaning project...${NC}"
cd android && ./gradlew clean
echo -e "${GREEN}✅ Project cleaned${NC}"

# Step 6: Build the production bundle
echo -e "${BLUE}🏗️ Building production bundle...${NC}"
echo -e "${YELLOW}This might take several minutes. Please be patient.${NC}"
./gradlew :app:bundleRelease

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Production bundle built successfully!${NC}"
  
  # Find the generated AAB file
  AAB_FILE=$(find . -name "*.aab" | grep "release" | sort -r | head -n 1)
  
  if [ -n "$AAB_FILE" ]; then
    echo -e "${GREEN}📦 Production bundle generated at:${NC}"
    echo -e "${BLUE}$AAB_FILE${NC}"
    echo ""
    echo -e "${YELLOW}To upload to Google Play Store:${NC}"
    echo "1. Go to Google Play Console: https://play.google.com/console/"
    echo "2. Navigate to your app > Production > Create new release"
    echo "3. Upload the AAB file and follow the prompts"
    echo ""
  else
    echo -e "${YELLOW}⚠️ AAB file not found. Check the build output directory.${NC}"
  fi
else
  echo -e "${RED}❌ Build failed. Check the error messages above.${NC}"
fi

cd ..
echo ""
echo -e "${GREEN}✅ Build process completed!${NC}"
