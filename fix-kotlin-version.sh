#!/bin/bash

# filepath: /Applications/MilkMatrix/fix-kotlin-version.sh
# Fix Kotlin Version Issue for MilkMatrix Build
# This script specifically addresses the "Key 1.6.10 is missing in the map" error

echo "🔧 MilkMatrix Kotlin Version Fix"
echo "==============================="

# Set text colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Update gradle.properties with compatible Kotlin version
echo -e "${YELLOW}📝 Setting correct Kotlin version...${NC}"

if [ -f "android/gradle.properties" ]; then
  # Add the correct Kotlin version that is known to work with Expo
  echo "" >> android/gradle.properties
  echo "# Explicitly set Kotlin version to stable version compatible with Expo modules" >> android/gradle.properties
  echo "kotlinVersion=1.5.31" >> android/gradle.properties
  echo "KOTLIN_VERSION=1.5.31" >> android/gradle.properties
  
  # Disable Kotlin version check to avoid build issues
  echo "# Disable Kotlin version check to avoid build issues" >> android/gradle.properties
  echo "android.kotlin.version.compatibility=1.5.31" >> android/gradle.properties
  
  echo -e "${GREEN}✅ gradle.properties updated with Kotlin 1.5.31${NC}"
else
  echo -e "${RED}❌ android/gradle.properties not found.${NC}"
fi

# Step 2: Update the kotlin-fix.gradle file to ensure it's using 1.5.31
echo -e "${YELLOW}📝 Updating kotlin-fix.gradle file...${NC}"

if [ -f "android/kotlin-fix.gradle" ]; then
  # Make sure we're using 1.5.31 which is known to work with Expo
  sed -i '' 's/kotlin-stdlib:[0-9.]\+/kotlin-stdlib:1.5.31/g' android/kotlin-fix.gradle
  sed -i '' 's/kotlin-stdlib-common:[0-9.]\+/kotlin-stdlib-common:1.5.31/g' android/kotlin-fix.gradle
  sed -i '' 's/kotlin-stdlib-jdk7:[0-9.]\+/kotlin-stdlib-jdk7:1.5.31/g' android/kotlin-fix.gradle
  sed -i '' 's/kotlin-stdlib-jdk8:[0-9.]\+/kotlin-stdlib-jdk8:1.5.31/g' android/kotlin-fix.gradle
  sed -i '' 's/kotlin-reflect:[0-9.]\+/kotlin-reflect:1.5.31/g' android/kotlin-fix.gradle
  
  echo -e "${GREEN}✅ kotlin-fix.gradle updated to use version 1.5.31${NC}"
else
  echo -e "${YELLOW}⚠️ kotlin-fix.gradle not found. Creating it...${NC}"
  
  # Create the kotlin-fix.gradle file
  cat > "android/kotlin-fix.gradle" << 'EOL'
// Force consistent Kotlin version across all dependencies
buildscript {
    repositories {
        google()
        mavenCentral()
    }
}

subprojects {
    configurations.all {
        resolutionStrategy {
            // Force specific Kotlin version known to work with Expo
            force 'org.jetbrains.kotlin:kotlin-stdlib:1.5.31'
            force 'org.jetbrains.kotlin:kotlin-stdlib-common:1.5.31'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.5.31'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.5.31'
            force 'org.jetbrains.kotlin:kotlin-reflect:1.5.31'
        }
    }
}
EOL
  
  echo -e "${GREEN}✅ kotlin-fix.gradle created${NC}"
fi

# Step 3: Update android/build.gradle to explicitly use the Kotlin version
echo -e "${YELLOW}📝 Updating build.gradle to use explicit Kotlin version...${NC}"

if [ -f "android/build.gradle" ]; then
  # Make backup of build.gradle
  cp android/build.gradle android/build.gradle.bak
  
  # Apply kotlin-fix.gradle
  if ! grep -q "apply from: 'kotlin-fix.gradle'" android/build.gradle; then
    sed -i '' '/apply plugin: "expo-root-project"/a\
apply from: "kotlin-fix.gradle"' android/build.gradle
    echo -e "${GREEN}✅ Added kotlin-fix.gradle reference to build.gradle${NC}"
  else
    echo -e "${YELLOW}ℹ️ kotlin-fix.gradle already referenced in build.gradle${NC}"
  fi
  
  # Update Kotlin plugin version in buildscript if needed
  if grep -q "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')" android/build.gradle; then
    sed -i '' "s/classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')/classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.5.31')/g" android/build.gradle
    echo -e "${GREEN}✅ Specified Kotlin plugin version in build.gradle${NC}"
  fi
  
  echo -e "${GREEN}✅ build.gradle updated${NC}"
else
  echo -e "${RED}❌ android/build.gradle not found.${NC}"
fi

# Step 4: Update app/build.gradle if needed
echo -e "${YELLOW}📝 Checking app/build.gradle for Kotlin version...${NC}"

if [ -f "android/app/build.gradle" ]; then
  if grep -q "kotlin-android" android/app/build.gradle; then
    echo -e "${YELLOW}ℹ️ Found Kotlin Android plugin in app/build.gradle${NC}"
    
    # Make backup of app/build.gradle
    cp android/app/build.gradle android/app/build.gradle.bak
    
    # Update Kotlin version if needed
    if ! grep -q "kotlinVersion = " android/app/build.gradle; then
      sed -i '' "/apply plugin: \"kotlin-android\"/i\\
def kotlinVersion = rootProject.ext.has('kotlinVersion') ? rootProject.ext.get('kotlinVersion') : '1.5.31'" android/app/build.gradle
      echo -e "${GREEN}✅ Added Kotlin version definition to app/build.gradle${NC}"
    fi
    
    echo -e "${GREEN}✅ app/build.gradle updated${NC}"
  else
    echo -e "${YELLOW}ℹ️ app/build.gradle doesn't use Kotlin Android plugin${NC}"
  fi
else
  echo -e "${YELLOW}ℹ️ android/app/build.gradle not found.${NC}"
fi

echo ""
echo -e "${GREEN}✅ Kotlin version fix complete!${NC}"
echo ""
echo "Try building your app again with:"
echo "    cd android && ./gradlew :app:bundleRelease"
echo ""
echo "Or using the full build script:"
echo "    ./build-with-fixes.sh"
echo ""
echo "If you still encounter issues, try:"
echo "    export EXPO_NO_KOTLIN_VERSION_CHECK=1"
echo "    npx eas-cli build --platform android --profile production --local"
echo "
