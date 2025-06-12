#!/bin/bash

# MilkMatrix SDK License Fix
# This script handles the NDK licensing issue for Android builds

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 MilkMatrix Android SDK License Fix${NC}"
echo "=================================="

# Detect Android SDK location
detect_android_sdk() {
  # Try common locations
  local possible_locations=(
    "$HOME/Library/Android/sdk"
    "/usr/local/lib/android/sdk"
    "$HOME/Android/Sdk"
    "/Applications/Android Studio.app/Contents/sdk"
    "/usr/local/Caskroom/android-platform-tools/*/platform-tools/.."
  )

  for location in "${possible_locations[@]}"; do
    # Expand any wildcards
    for expanded_path in $location; do
      if [ -d "$expanded_path" ]; then
        echo "$expanded_path"
        return 0
      fi
    done
  done

  # Not found in common locations, try to find from environment
  if [ -n "$ANDROID_HOME" ] && [ -d "$ANDROID_HOME" ]; then
    echo "$ANDROID_HOME"
    return 0
  fi
  
  echo ""
  return 1
}

# Find Android SDK path
ANDROID_SDK_PATH=$(detect_android_sdk)
if [ -z "$ANDROID_SDK_PATH" ]; then
  echo -e "${RED}❌ Android SDK not found in common locations.${NC}"
  echo -e "${YELLOW}Please specify the Android SDK location manually:${NC}"
  read -p "Android SDK path: " ANDROID_SDK_PATH
  
  if [ ! -d "$ANDROID_SDK_PATH" ]; then
    echo -e "${RED}❌ Invalid SDK path. Exiting.${NC}"
    exit 1
  fi
fi

# Export SDK path
export ANDROID_HOME="$ANDROID_SDK_PATH"
echo -e "${GREEN}📱 Using Android SDK at: $ANDROID_HOME${NC}"

# Create required license files
echo -e "${YELLOW}📝 Creating required license files...${NC}"

# Create licenses directory if it doesn't exist
mkdir -p "$ANDROID_HOME/licenses"

# Create/Update Android SDK license
echo "8933bad161af4178b1185d1a37fbf41ea5269c55" > "$ANDROID_HOME/licenses/android-sdk-license"

# Create/Update Android NDK license
echo "8933bad161af4178b1185d1a37fbf41ea5269c55
d56f5187479451cdedfc0b45" > "$ANDROID_HOME/licenses/android-ndk-license"

# Add additional common license files
echo "84831b9409646a918e30573bab4c9c91346d8abd" > "$ANDROID_HOME/licenses/android-sdk-preview-license"
echo "d975f751698a77b662f1254ddbeed3901e976f5a" > "$ANDROID_HOME/licenses/intel-android-extra-license"

echo -e "${GREEN}✅ License files created.${NC}"

# Update local.properties with correct SDK path
echo -e "${YELLOW}📝 Updating local.properties with correct SDK path...${NC}"
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
echo -e "${GREEN}✅ local.properties updated.${NC}"

# Check for NDK installation
if [ ! -d "$ANDROID_HOME/ndk" ] && [ ! -d "$ANDROID_HOME/ndk-bundle" ]; then
  echo -e "${YELLOW}⚠️  NDK not found. Your build might fail.${NC}"
  echo -e "${YELLOW}   Consider installing NDK through Android Studio or sdkmanager.${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Now you can try building your app again with:${NC}"
echo -e "    ${YELLOW}cd android && ./gradlew :app:bundleRelease${NC}"
echo ""

# If gradlew doesn't exist, provide guidance
if [ ! -f "android/gradlew" ]; then
  echo -e "${YELLOW}⚠️ gradlew not found in android/ directory.${NC}"
  echo -e "   Run: ${YELLOW}cd android && gradle wrapper${NC}"
  echo -e "   Or use: ${YELLOW}eas build --platform android${NC}"
fi

echo -e "${YELLOW}💡 If you still encounter issues with NDK, you might need to install it manually:${NC}"
echo -e "   - Open Android Studio → SDK Manager → SDK Tools tab"
echo -e "   - Check 'NDK (Side by Side)' and click 'Apply'"
echo ""
