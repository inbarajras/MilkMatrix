/**
 * Extracts a cow ID from either a direct UUID string or a JSON object with an ID field
 * 
 * @param {string} scannedData - Raw data from QR code scanning
 * @returns {string} The extracted cow ID
 */
export const extractCowIdFromQR = (scannedData) => {
  // Default to using scanned data directly
  let cowId = scannedData;
  
  // Check if the scanned data is a JSON string
  try {
    const jsonData = JSON.parse(scannedData);
    // If it's a JSON object with an id field, use that ID
    if (jsonData && jsonData.id) {
      cowId = jsonData.id;
      console.log('Extracted cow ID from JSON:', cowId);
    }
  } catch (parseError) {
    // Not JSON, assume it's a direct UUID string
    console.log('Using scanned data directly as ID');
  }
  
  return cowId;
};

/**
 * Utility function to handle navigation to tab screens
 * Ensures proper navigation between stack screens and tab screens
 * 
 * @param {object} navigation - The navigation object from React Navigation
 * @param {string} tabName - Name of the tab to navigate to
 * @param {object} params - Parameters to pass to the tab screen
 */
export const navigateToTab = (navigation, tabName, params = {}) => {
  // Navigate using the correct pattern to avoid duplicate tabs
  navigation.navigate('MainTabs', { 
    screen: tabName,
    params
  });
};

/**
 * Navigate to a tab screen with a cow object
 * 
 * @param {object} navigation - The navigation object from React Navigation
 * @param {string} tabName - Name of the tab to navigate to (RecordMilk, RecordHealth, etc.)
 * @param {object} cow - The cow object to pass to the screen
 */
export const navigateWithCow = (navigation, tabName, cow) => {
  navigateToTab(navigation, tabName, { cow });
};
