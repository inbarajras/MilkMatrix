#!/bin/bash

# MilkMatrix Build Helper Script
# This script helps build the app with fixes for common issues

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 MilkMatrix Build Helper${NC}"
echo "================================="

# Step 1: Run patches for Expo modules compatibility
echo -e "${YELLOW}Applying patches for Expo modules...${NC}"
./patch-expo-modules.sh

# Step 2: Update the EAS config to use simplified build profile
echo -e "${YELLOW}Creating simplified build configuration...${NC}"

# Create a temporary simple build profile
cat > /tmp/simple-eas.json << 'EOL'
{
  "cli": {
    "version": ">= 0.53.0"
  },
  "build": {
    "simple": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug",
        "withoutCredentials": true,
        "image": "ubuntu-22.04-jdk-17-ndk-r21e",
        "cache": {
          "disabled": true
        }
      }
    }
  }
}
EOL

# Offer build options
echo -e "${GREEN}Choose a build option:${NC}"
echo "1) Simple debug APK (fastest, most compatible)"
echo "2) Release APK (faster than AAB, good for testing)"
echo "3) Production AAB (for Play Store submission)"
echo -n "Enter your choice (1-3): "
read choice

case $choice in
  1)
    echo -e "${YELLOW}Building simple debug APK...${NC}"
    cp /tmp/simple-eas.json eas.json
    eas build --platform android --profile simple --non-interactive
    ;;
  2)
    echo -e "${YELLOW}Building release APK...${NC}"
    eas build --platform android --profile basic-apk
    ;;
  3)
    echo -e "${YELLOW}Building production AAB...${NC}"
    
    # Ask if they want to apply special flags for AAB build
    echo -e "${YELLOW}Would you like to use special flags to improve compatibility? (y/n)${NC}"
    read use_flags
    
    if [[ $use_flags == "y" || $use_flags == "Y" ]]; then
      # Use special flags for AAB build
      GRADLE_OPTS="-Dorg.gradle.project.kotlinVersion=1.6.10" \
      EXPO_NO_KOTLIN_VERSION_CHECK=1 \
      eas build --platform android --profile production
    else
      # Regular AAB build
      eas build --platform android --profile production
    fi
    ;;
  *)
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}Build process started! Monitor progress at https://expo.dev${NC}"
