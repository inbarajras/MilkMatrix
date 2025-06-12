# Production Build Guide for MilkMatrix

## Prerequisites

1. **EAS CLI Installation**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Expo Account**
   - Create account at https://expo.dev
   - Login: `eas login`

3. **Google Play Console Account**
   - Developer account for Play Store submission

## Build Configuration

### 1. Initialize EAS Build
```bash
cd /Applications/MilkMatrix
eas build:configure
```

### 2. Android Production Build
```bash
# Build AAB for Play Store
eas build --platform android --profile production
```

### 3. Android Preview Build (APK for testing)
```bash
# Build APK for testing
eas build --platform android --profile preview
```

## Production Checklist

### App Configuration ✅
- [x] Updated app.json with production settings
- [x] Set Android package name: `com.milkmatrix.app`
- [x] Set version code: 1
- [x] Added required permissions
- [x] Updated splash screen background color
- [x] Created eas.json configuration

### Code Quality
- [x] User authentication implemented
- [x] Real user names instead of hardcoded values
- [x] Blue theme applied consistently
- [x] Cow selection with both QR and dropdown options
- [x] Error handling implemented
- [x] Offline considerations

### Security
- [ ] Review Supabase RLS policies
- [ ] Ensure API keys are properly secured
- [ ] Test authentication flows

### Testing
- [ ] Test on physical Android device
- [ ] Test all major user flows
- [ ] Test QR scanning functionality
- [ ] Test dropdown cow selection
- [ ] Test offline scenarios
- [ ] Performance testing

### Play Store Requirements
- [ ] App signing key generated
- [ ] Privacy policy created
- [ ] App description and metadata
- [ ] Screenshots and promotional graphics
- [ ] Content rating completed

## Build Commands

### Development/Testing
```bash
# Start development server
npm start

# Build preview APK
npm run build:android:preview
```

### Production
```bash
# Build production AAB
npm run build:android:production

# Submit to Play Store
npm run submit:android
```

## Environment Variables

Create `.env` file for production configuration:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Post-Build Steps

1. **Download AAB file** from EAS build dashboard
2. **Upload to Google Play Console**
3. **Complete Play Store listing**
4. **Submit for review**

## Troubleshooting

### Common Issues
- **Build fails**: Check dependencies and permissions
- **Signing issues**: Ensure proper Android keystore configuration
- **Upload fails**: Verify AAB format and version code increment

### Support
- EAS Build docs: https://docs.expo.dev/build/introduction/
- Play Store guide: https://docs.expo.dev/submit/android/
