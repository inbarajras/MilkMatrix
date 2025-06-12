# Play Store Production Build Guide

This guide provides step-by-step instructions for creating a production-ready build of MilkMatrix for the Google Play Store.

## Prerequisites

1. **Node.js and npm** installed
2. **Expo CLI** installed globally: `npm install -g @expo/cli`
3. **EAS CLI** installed globally: `npm install -g eas-cli`
4. **Expo account** created and logged in
5. **Google Play Console** account with app registered

## Step 1: Install EAS CLI

If you haven't already, install EAS CLI globally:

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
eas login
```

Enter your Expo account credentials.

## Step 3: Configure the Project

The project is already configured with the necessary files:
- `app.json` - Contains app metadata and configuration
- `eas.json` - Contains build profiles for EAS Build
- `package.json` - Contains build scripts

## Step 4: Initialize EAS Project (if needed)

If this is the first time building with EAS:

```bash
eas build:configure
```

This will create/update the `eas.json` file and link your project to EAS.

## Step 5: Generate Android Keystore

For production builds, you need a keystore for signing:

```bash
eas credentials
```

Select:
1. Android
2. Production
3. Generate new keystore

Save the keystore information securely - you'll need it for future updates.

## Step 6: Build Production APK/AAB

### Option A: Build AAB for Play Store (Recommended)

```bash
npm run build:android:production
```

or directly:

```bash
eas build --platform android --profile production
```

### Option B: Build APK for testing

```bash
npm run build:android:preview
```

## Step 7: Monitor Build Progress

After running the build command:
1. The build will start on Expo's servers
2. You can monitor progress at: https://expo.dev/accounts/[your-username]/projects/milk-matrix/builds
3. You'll receive email notifications when the build completes

## Step 8: Download the Build

Once complete:
1. Download the `.aab` file from the Expo dashboard
2. Or use the direct download link provided in the terminal

## Step 9: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to "Production" → "Releases"
4. Click "Create new release"
5. Upload the `.aab` file
6. Fill in release notes
7. Review and publish

## Build Configuration Details

### App Configuration (`app.json`)
- **Package name**: `com.milkmatrix.app`
- **Version**: 1.0.0
- **Version code**: 1
- **Target SDK**: 34
- **Permissions**: Camera, Internet, Network State

### Build Profiles (`eas.json`)
- **Production**: Creates AAB for Play Store
- **Preview**: Creates APK for testing
- **Development**: Creates development client

## Troubleshooting

### Common Issues

1. **"Project not found" error**
   ```bash
   eas init
   ```

2. **Keystore issues**
   ```bash
   eas credentials --clear-cache
   eas credentials
   ```

3. **Build fails due to dependencies**
   ```bash
   npm install
   expo install --fix
   ```

4. **Expo CLI version conflicts**
   ```bash
   npm install -g @expo/cli@latest
   npm install -g eas-cli@latest
   ```

5. **"Android Gradle plugin requires Java 17" error**
   ```bash
   # Run the fix-build-errors.sh script
   ./fix-build-errors.sh
   
   # Or manually update eas.json to use JDK 17:
   # Change "image": "ubuntu-22.04-jdk-11-ndk-r21e" to:
   # "image": "ubuntu-22.04-jdk-17-ndk-r21e"
   ```

### Build Requirements Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Logged into Expo (`eas login`)
- [ ] Project configured (`eas.json` exists)
- [ ] Keystore generated (for production)
- [ ] App registered in Google Play Console
- [ ] Privacy policy URL added (if required)
- [ ] App icons and splash screen configured

## Security Notes

1. **Never commit keystore files** to version control
2. **Keep keystore backup** in a secure location
3. **Use environment variables** for sensitive data
4. **Enable Google Play App Signing** for additional security

## Build Commands Summary

```bash
# Install dependencies
npm install

# Login to Expo
eas login

# Configure project (first time only)
eas build:configure

# Generate keystore (first time only)
eas credentials

# Build for production (AAB for Play Store)
npm run build:android:production

# Build for testing (APK)
npm run build:android:preview

# Submit to Play Store (optional)
npm run submit:android
```

## Next Steps After Upload

1. **Internal Testing**: Upload to internal testing track first
2. **Review Process**: Google will review your app (can take 1-7 days)
3. **Release**: Once approved, release to production
4. **Monitoring**: Monitor crash reports and user feedback

## Support

For issues with:
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Google Play Console**: https://support.google.com/googleplay/android-developer/
- **App Configuration**: https://docs.expo.dev/workflow/configuration/
