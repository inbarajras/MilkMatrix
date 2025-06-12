#!/bin/bash

# MilkMatrix Production Build Script for Play Store
# This script creates a production-ready build for Google Play Store

echo "🚀 Starting MilkMatrix Production Build Process..."
echo "=================================================="

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "⚠️  Expo CLI not found. Installing..."
    npm install -g @expo/cli
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "⚠️  EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

echo "✅ Prerequisites check completed."

# Step 2: Install dependencies
echo "📦 Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check package.json."
    exit 1
fi

echo "✅ Dependencies installed successfully."

# Step 3: Validate configuration
echo "🔍 Validating project configuration..."

# Check if app.json exists and is valid
if [ ! -f "app.json" ]; then
    echo "❌ app.json not found. Please ensure the file exists."
    exit 1
fi

# Check if eas.json exists
if [ ! -f "eas.json" ]; then
    echo "⚠️  eas.json not found. Creating default configuration..."
    eas build:configure
fi

echo "✅ Configuration validation completed."

# Step 4: Login to Expo (if not already logged in)
echo "🔐 Checking Expo login status..."

if ! eas whoami &> /dev/null; then
    echo "⚠️  Not logged into Expo. Please login:"
    eas login
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to login to Expo. Please try again."
        exit 1
    fi
else
    echo "✅ Already logged into Expo."
fi

# Step 5: Configure EAS project (if needed)
echo "⚙️  Configuring EAS project..."

if ! eas project:info &> /dev/null; then
    echo "⚠️  Project not configured with EAS. Configuring..."
    eas init --id milk-matrix-production
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to configure EAS project. Please check your Expo account."
        exit 1
    fi
else
    echo "✅ EAS project already configured."
fi

# Step 6: Setup credentials (Android keystore)
echo "🔑 Setting up Android credentials..."

echo "Do you want to generate a new Android keystore? (y/n)"
read -r generate_keystore

if [ "$generate_keystore" = "y" ] || [ "$generate_keystore" = "Y" ]; then
    eas credentials
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to setup credentials. Please try again."
        exit 1
    fi
else
    echo "ℹ️  Skipping keystore generation. Make sure you have valid credentials."
fi

# Step 7: Build the app
echo "🏗️  Starting production build..."

echo "Choose build type:"
echo "1) AAB for Google Play Store (Recommended)"
echo "2) APK for testing"
echo "Enter your choice (1 or 2):"

read -r build_choice

case $build_choice in
    1)
        echo "🏗️  Building AAB for Google Play Store..."
        eas build --platform android --profile production
        ;;
    2)
        echo "🏗️  Building APK for testing..."
        eas build --platform android --profile preview
        ;;
    *)
        echo "❌ Invalid choice. Building AAB by default..."
        eas build --platform android --profile production
        ;;
esac

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📱 Next steps:"
    echo "1. Download the build from Expo dashboard"
    echo "2. Upload to Google Play Console"
    echo "3. Fill in app details and publish"
    echo ""
    echo "🌐 Monitor your build at: https://expo.dev"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo "🎉 MilkMatrix production build process completed!"
