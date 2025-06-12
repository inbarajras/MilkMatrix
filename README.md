# Dairy Farm Manager Mobile App

A React Native Expo mobile application for dairy farm employees to record milk production and health events. The app integrates with Supabase for data storage and includes QR scanning functionality for cattle identification.

## Features

- **User Authentication** - Secure login for farm employees
- **QR Code Scanning** - Quick cow identification using QR codes
- **Milk Recording** - Record milk production with quantity, fat content, and protein content
- **Health Event Recording** - Track health events, treatments, and veterinary visits
- **Dashboard** - View daily summaries and recent activities
- **Records Management** - Browse and search milk and health records
- **Offline Support** - Basic offline functionality for poor connectivity areas

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Supabase](https://supabase.com/) account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd /Applications/MilkMatrix

# Install dependencies
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the database tables (see Database Schema section)
3. Copy your project URL and anon key
4. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

5. Update the `.env` file with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Database Schema

The app uses a comprehensive database schema designed for complete dairy farm management. Create the following tables in your Supabase database by running the SQL script from `DATABASE_SETUP.md`.

Important: Please see `DATABASE_FIELD_MAPPING.md` for the mappings between UI field names and database column names to avoid errors.

#### Core Tables:
- **cows** - Complete cattle information including health status, breeding data, and tracking
- **milk_production** - Daily milk records with quality parameters (fat, protein, lactose)
- **health_events** - Veterinary records, treatments, and health monitoring
- **breeding_events** - Breeding history and reproductive management
- **reproductive_status** - Current reproductive status tracking

#### Financial Management:
- **financial_stats** - Monthly financial metrics and KPIs
- **revenue_data** - Income and expense tracking by month
- **customers** - Customer management and sales tracking
- **expenses** - Expense categorization and vendor management
- **invoices** & **invoice_items** - Billing and accounts receivable

#### Employee Management:
- **employees** - Staff information and HR records
- **employee_attendance** - Daily attendance tracking
- **performance_reviews** - Performance evaluation system
- **employee_shifts** - Shift scheduling and management
- **payroll_payments** - Payroll processing and history

#### Inventory & Operations:
- **inventory_items** - Feed, equipment, and supply management
- **suppliers** - Vendor information and sourcing
- **purchase_orders** - Procurement and ordering system
- **medications** - Veterinary supply tracking
- **vaccination_schedule** - Preventive health management

#### System Administration:
- **profiles** - User accounts and role management
- **audit_logs** - System activity tracking
- **system_settings** - Configuration management
- **reports** - Generated report metadata

For the complete SQL schema with all relationships, triggers, and indexes, see `DATABASE_SETUP.md`.

### 4. Run the Application

```bash
# Start the Expo development server
npm start

# Or run on specific platforms
npm run android
npm run ios
npm run web
```

## Usage

### Authentication
- Employees log in using their email and password
- User authentication is handled through Supabase Auth

### Recording Milk Production
1. Tap "Record Milk" or use the QR scanner
2. Scan the cow's QR tag or select manually
3. Enter milk quantity (required)
4. Optionally add fat content and protein content
5. Add notes if needed
6. Save the record

### Recording Health Events
1. Tap "Health Event" or use the QR scanner
2. Scan the cow's QR tag or select manually
3. Select event type (vaccination, illness, etc.)
4. Set status (pending, completed, urgent, cancelled)
5. Enter description and treatment details
6. Save the record

### QR Code Scanning
- QR codes can contain either:
  1. The cow's unique ID (UUID) directly, or
  2. A JSON object with an "id" field containing the UUID
- The app will automatically extract the ID and look up the cow
- Do NOT use tag numbers alone in QR codes as they may not uniquely identify a cow
- After scanning, choose to record milk or health events

## Technology Stack

- **React Native** with Expo
- **Supabase** for backend services
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **Expo Camera** for QR code scanning

## Project Structure

```
src/
├── components/         # Reusable UI components
│   └── QRScanner.js   # QR code scanner component
├── contexts/          # React contexts
│   └── AuthContext.js # Authentication context
├── navigation/        # Navigation configuration
│   └── AppNavigator.js
├── screens/           # Screen components
│   ├── HomeScreen.js
│   ├── LoginScreen.js
│   ├── RecordMilkScreen.js
│   ├── RecordHealthScreen.js
│   ├── MilkRecordsScreen.js
│   ├── HealthRecordsScreen.js
│   └── QRScanScreen.js
├── services/          # API and service functions
│   ├── supabase.js
│   ├── milkService.js
│   ├── healthService.js
│   └── cowService.js
└── utils/             # Utility functions
```

## Development

### Code Guidelines
- Use functional components with React hooks
- Follow React Native best practices
- Implement proper error handling for API calls
- Ensure mobile-optimized UI/UX
- Handle offline scenarios gracefully

### Adding New Features
1. Create service functions in `src/services/`
2. Add screens to `src/screens/`
3. Update navigation in `src/navigation/AppNavigator.js`
4. Add any required database tables or changes

## Deployment

### Building for Production

```bash
# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

### Environment Variables for Production
Make sure to set the following environment variables for production:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues

1. **Camera Permission Denied**
   - Ensure camera permissions are granted in device settings
   - Check that `expo-camera` plugin is properly configured

2. **Supabase Connection Issues**
   - Verify environment variables are set correctly
   - Check Supabase project settings and RLS policies

3. **Build Errors**
   - Clear Expo cache: `npx expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Known Compatibility Issues (Resolved)

**WebSocket/Node.js Module Issues**: This app uses Supabase v2.38.0 and custom Metro configuration to resolve React Native compatibility issues with Node.js modules like `ws`, `stream`, etc. The current configuration:

- Uses polyfills for Node.js modules (readable-stream, buffer, events)
- Disables problematic WebSocket packages
- Uses mock realtime client for React Native compatibility
- Real-time features are disabled but all core functionality works

**Camera/Barcode Scanner Issues**: Updated to use the latest `expo-camera` API instead of the deprecated `expo-barcode-scanner`:

- Uses `CameraView` component from `expo-camera`
- Proper permission handling with `Camera.requestCameraPermissionsAsync()`
- Supports multiple barcode types (QR, Code128, EAN13, etc.)
- Enhanced error handling and user feedback

If you encounter bundling errors related to Node.js modules or camera permissions, ensure you're using the exact versions specified in `package.json`.

## Support

For issues related to:
- **Expo**: [Expo Documentation](https://docs.expo.dev/)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **React Native**: [React Native Documentation](https://reactnative.dev/docs/getting-started)

## License

This project is licensed under the MIT License.
