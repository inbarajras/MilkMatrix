/**
 * Utility functions for handling errors consistently across the app
 */

/**
 * Formats an error message for display
 * @param {Error|Object|string} error - The error to format
 * @param {string} fallbackMessage - Fallback message if error is empty
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error, fallbackMessage = 'An unknown error occurred') => {
  if (!error) return fallbackMessage;
  
  // If it's a string, return it directly
  if (typeof error === 'string') return error;
  
  // Handle Supabase AuthApiError specifically
  if (error.name === 'AuthApiError' || error.name === 'AuthError') {
    return error.message || 'Authentication error';
  }
  
  // If it has a message property (standard Error object)
  if (error.message) return error.message;
  
  // If it's a Supabase error with error.error
  if (error.error && typeof error.error === 'string') return error.error;
  
  // If it's a Supabase error with error.details
  if (error.details) return error.details;
  
  // If all else fails, convert to string
  try {
    return JSON.stringify(error);
  } catch (e) {
    return fallbackMessage;
  }
};

/**
 * Logs an error to console with consistent format
 * @param {string} source - Source of the error (component/function name)
 * @param {Error|Object|string} error - The error object
 */
export const logError = (source, error) => {
  console.error(`[ERROR][${source}]`, error);
};

/**
 * Handle API error and set snackbar message
 * @param {Error|Object|string} error - The error object
 * @param {Function} showError - Function to show error message (takes message string)
 */
export const handleApiError = (error, showError) => {
  // Handle duplicate record errors with special formatting
  if (error && error.code === 'DUPLICATE_RECORD') {
    showError(error.message);
    return;
  }
  
  const message = formatErrorMessage(error);
  showError(message);
};
