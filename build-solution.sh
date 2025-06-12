#!/bin/bash

# MilkMatrix Build Solution Script
# This script provides multiple build approaches to resolve Kotlin compatibility issues

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 MilkMatrix Build Solution${NC}"
echo "================================"
echo "This script provides multiple approaches to build the app"
echo "and resolve Kotlin compatibility issues."

# Function to update gradle.properties with the specified Kotlin version
update_kotlin_version() {
    local version=$1
    echo -e "${YELLOW}Updating Kotlin version to ${version}...${NC}"
    
    if [ -f "android/gradle.properties" ]; then
        sed -i '' "s/kotlinVersion=.*/kotlinVersion=${version}/g" android/gradle.properties
        sed -i '' "s/KOTLIN_VERSION=.*/KOTLIN_VERSION=${version}/g" android/gradle.properties
        echo "# Disable Kotlin version check to avoid build issues" >> android/gradle.properties
        echo "android.kotlin.version.compatibility=${version}" >> android/gradle.properties
        echo -e "${GREEN}✅ Kotlin version updated to ${version}${NC}"
    else
        echo -e "${RED}❌ android/gradle.properties not found${NC}"
    fi
}

# Function to create a custom eas.json configuration
create_custom_eas_config() {
    local kotlin_version=$1
    local build_type=$2
    local name=$3
    
    echo -e "${YELLOW}Creating custom build profile for ${name}...${NC}"
    
    cat > "eas-${name}.json" << EOL
{
  "cli": {
    "version": ">= 0.53.0"
  },
  "build": {
    "${name}": {
      "android": {
        "buildType": "${build_type}",
        "gradleCommand": ":app:${build_type == "apk" ? "assembleRelease" : "bundleRelease"}",
        "withoutCredentials": ${build_type == "apk" ? "true" : "false"},
        "distribution": "internal",
        "image": "ubuntu-22.04-jdk-17-ndk-r21e",
        "env": {
          "EXPO_NO_KOTLIN_VERSION_CHECK": "1",
          "KOTLIN_VERSION": "${kotlin_version}"
        }
      }
    }
  }
}
EOL
    echo -e "${GREEN}✅ Custom build profile created: eas-${name}.json${NC}"
}

# Function to create a prebuild script for local builds
create_prebuild_script() {
    echo -e "${YELLOW}Creating prebuild script...${NC}"
    
    mkdir -p android/scripts
    cat > "android/scripts/prebuild.sh" << 'EOL'
#!/bin/bash

echo "📝 Applying fixes for Expo modules..."

# Update kotlinVersion in all required modules
find ../node_modules -name "build.gradle" -type f -exec sh -c '
    MODULE=$(dirname "{}")
    MODULE_NAME=$(basename "$MODULE")
    echo "Checking module: $MODULE_NAME"
    if grep -q "kotlinVersion" "{}"; then
        echo "Updating kotlinVersion in $MODULE_NAME"
        sed -i "" "s/kotlinVersion = \".*\"/kotlinVersion = \"1.5.31\"/g" "{}"
    fi
' \;

echo "✅ Prebuild fixes applied"
EOL

    chmod +x android/scripts/prebuild.sh
    echo -e "${GREEN}✅ Prebuild script created${NC}"
}

# Function to run the local dev build
run_local_dev_build() {
    echo -e "${YELLOW}Preparing for local development build...${NC}"
    
    # Create the prebuild script
    create_prebuild_script
    
    # First run prebuild with expo
    echo -e "${YELLOW}Generating Android project files...${NC}"
    EXPO_NO_KOTLIN_VERSION_CHECK=1 npx expo prebuild --platform android --clean
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Prebuild failed. Cannot continue with local build.${NC}"
        return 1
    fi
    
    # Apply the Kotlin fix gradle file
    echo -e "${YELLOW}Applying Kotlin fixes...${NC}"
    if [ -f "android/kotlin-fix.gradle" ]; then
        echo "apply from: './kotlin-fix.gradle'" >> android/build.gradle
        echo -e "${GREEN}✅ Applied Kotlin fixes to build.gradle${NC}"
    fi
    
    # Run the prebuild script
    if [ -f "android/scripts/prebuild.sh" ]; then
        cd android && ./scripts/prebuild.sh && cd ..
    fi
    
    # Build debug APK
    echo -e "${YELLOW}Building debug APK...${NC}"
    cd android && ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Debug APK built successfully!${NC}"
        echo -e "${GREEN}APK location: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    else
        echo -e "${RED}❌ Debug APK build failed.${NC}"
        return 1
    fi
}

# Function to run the EAS build with the specified profile
run_eas_build() {
    local profile=$1
    local config_file=$2
    
    echo -e "${YELLOW}Starting EAS build with profile ${profile}...${NC}"
    EXPO_NO_KOTLIN_VERSION_CHECK=1 eas build --platform android --profile ${profile} --config ${config_file} --non-interactive
    
    echo -e "${GREEN}✅ Build process initiated!${NC}"
    echo -e "${YELLOW}Monitor progress on the Expo website.${NC}"
}

# Main menu
echo ""
echo -e "${GREEN}Choose a build approach:${NC}"
echo "1) Local Development Build (fastest, generates APK locally)"
echo "2) EAS Build with Kotlin 1.5.31 (basic APK)"
echo "3) EAS Build with Kotlin 1.5.31 (production AAB)"
echo "4) EAS Build with Kotlin 1.4.32 (safer fallback)"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        run_local_dev_build
        ;;
    2)
        update_kotlin_version "1.5.31"
        create_custom_eas_config "1.5.31" "apk" "kotlin531-apk"
        run_eas_build "kotlin531-apk" "eas-kotlin531-apk.json"
        ;;
    3)
        update_kotlin_version "1.5.31"
        create_custom_eas_config "1.5.31" "app-bundle" "kotlin531-aab"
        run_eas_build "kotlin531-aab" "eas-kotlin531-aab.json"
        ;;
    4)
        update_kotlin_version "1.4.32"
        create_custom_eas_config "1.4.32" "apk" "kotlin432-apk"
        run_eas_build "kotlin432-apk" "eas-kotlin432-apk.json"
        ;;
    5)
        echo -e "${YELLOW}Exiting build script.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac
