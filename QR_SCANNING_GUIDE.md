# QR Code Scanning Guide for MilkMatrix

## Overview

The QR scanning functionality in MilkMatrix has been updated to use cow IDs (UUIDs) instead of tag numbers. This change improves reliability and prevents errors with non-unique tag numbers.

## QR Code Content Requirements

QR codes used with MilkMatrix can contain either:

1. **Direct UUID** - Just the cow's unique ID from the database (e.g., `44f71bbd-84e3-4e09-b215-10e6ea9f9943`)

2. **JSON Object** - A JSON object that includes at least an `id` field with the cow's UUID:
   ```json
   {
     "type": "cow",
     "id": "44f71bbd-84e3-4e09-b215-10e6ea9f9943",
     "tagNumber": "JUNE001",
     "name": "JUNE001",
     "breed": "Other"
   }
   ```

The app will automatically extract the ID from either format.

## Creating QR Codes

1. Access your Supabase dashboard
2. Navigate to the `cows` table
3. Find the cow you want to create a QR code for
4. Copy the cow's `id` field (this is a UUID format like: `123e4567-e89b-12d3-a456-426614174000`)
5. Use any QR code generator (online or app-based) to create a QR code with this value
6. Print the QR code and attach it to the cow's tag or stall

## Testing QR Codes

1. Generate a QR code with a valid cow ID from your database
2. Open the MilkMatrix app on your mobile device
3. Tap on the QR Scan button
4. Scan the QR code
5. The app should identify the cow and display options for recording

### QR Code Examples

#### Simple UUID QR Code (Recommended)
```
44f71bbd-84e3-4e09-b215-10e6ea9f9943
```

#### JSON QR Code (Compatible with Web App)
```json
{
  "type": "cow",
  "id": "44f71bbd-84e3-4e09-b215-10e6ea9f9943",
  "tagNumber": "JUNE001",
  "name": "JUNE001",
  "breed": "Other",
  "timestamp": "2025-06-01T12:32:32.770Z",
  "url": "https://dairy-farm-management-v1.vercel.app/cow/44f71bbd-84e3-4e09-b215-10e6ea9f9943"
}
```

## Technical Implementation

The application includes a robust QR code parsing system:

1. All QR scanning components use a shared utility function `extractCowIdFromQR()` from `src/utils/qrCodeUtils.js`
2. This function handles both simple UUID strings and complex JSON objects with ID fields
3. All scanning components use `cowService.getCowById()` for consistent lookup behavior
4. Error handling is standardized across all QR scanning interfaces

## Troubleshooting

If scanning a QR code results in "Cow Not Found" errors:

1. Verify the QR code contains the exact cow ID (UUID) from your database
2. Check that the cow ID still exists in your database
3. Ensure the QR code is clearly visible and not damaged
4. Try scanning in better lighting conditions
5. Check the console logs for extraction messages to see if the ID is being properly parsed
6. If issues persist, manually look up the cow using the search function

## Important Notes

- The old system that created test cows when scanning unknown tag numbers has been removed
- All QR codes must be updated to contain valid UUIDs
- Legacy QR codes with tag numbers will no longer work
