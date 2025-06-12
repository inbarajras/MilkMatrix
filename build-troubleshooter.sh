#!/bin/bash

echo "=================================="
echo "MilkMatrix Build Troubleshooter"
echo "=================================="
echo ""

# Function to show menu and get user selection
show_menu() {
  echo "Choose a build option to try:"
  echo "1) Basic APK build (fastest, no credentials needed)"
  echo "2) Preview APK build (with credentials)"
  echo "3) Production AAB build (for Play Store)"
  echo "4) Fix Kotlin version issue"
  echo "5) Reset project configuration"
  echo "q) Quit"
  echo ""
  echo -n "Select option (1-5 or q): "
  read -r choice
  echo ""
  return 0
}

# Function to fix Kotlin version
fix_kotlin_version() {
  echo "Fixing Kotlin version issue..."
  
  # Update gradle.properties
  echo "Setting Kotlin version to 1.6.21 in gradle.properties..."
  if [ -f "android/gradle.properties" ]; then
    # Check if kotlinVersion is already defined
    if grep -q "kotlinVersion=" android/gradle.properties; then
      # Replace the existing kotlinVersion line
      sed -i '' 's/kotlinVersion=.*/kotlinVersion=1.6.21/' android/gradle.properties
    else
      # Add the kotlinVersion line
      echo "kotlinVersion=1.6.21" >> android/gradle.properties
    fi
    echo "✅ Updated android/gradle.properties"
  else
    echo "⚠️ Cannot find android/gradle.properties"
  fi
  
  # Remove kotlinVersion from app.json if it exists
  echo "Removing kotlinVersion from app.json..."
  if [ -f "app.json" ]; then
    # Using temporary file for sed on macOS
    sed -i '' 's/"kotlinVersion": ".*",//' app.json
    echo "✅ Updated app.json"
  fi
  
  # Make sure app.config.js exists
  if [ ! -f "app.config.js" ]; then
    cat << EOF > app.config.js
// @ts-check
module.exports = {
  expo: {
    hooks: {
      postInstall: {
        config: ({ config }) => {
          // Force a specific Kotlin version in the Gradle build
          if (!config.android) config.android = {};
          // Remove kotlinVersion from config to avoid the "key missing in map" error
          delete config.android.kotlinVersion;
          return config;
        }
      }
    }
  }
};
EOF
    echo "✅ Created app.config.js"
  fi
  
  echo ""
  echo "Kotlin version fix applied!"
  echo "Now try the basic APK build by selecting option 1."
  echo ""
}

# Function to reset project configuration
reset_configuration() {
  echo "Resetting project configuration..."
  
  # Clear EAS cache
  eas credentials --clear-cache
  
  # Reinitialize EAS
  eas init
  
  echo ""
  echo "Project configuration reset!"
  echo ""
}

# Main loop
while true; do
  show_menu
  
  case "$choice" in
    1)
      echo "Starting basic APK build..."
      eas build --platform android --profile basic-apk
      ;;
    2)
      echo "Starting preview APK build..."
      eas build --platform android --profile preview
      ;;
    3)
      echo "Starting production AAB build..."
      eas build --platform android --profile production
      ;;
    4)
      fix_kotlin_version
      ;;
    5)
      reset_configuration
      ;;
    q|Q)
      echo "Exiting build troubleshooter."
      exit 0
      ;;
    *)
      echo "Invalid option. Please try again."
      ;;
  esac
  
  echo ""
  echo "Press Enter to continue..."
  read -r
  clear
done
