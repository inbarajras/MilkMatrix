// Import polyfills at the top
import 'react-native-get-random-values';

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Debug logging for environment variables
console.log('🔧 Supabase Configuration Debug:');
console.log('  URL:', SUPABASE_URL);
console.log('  Anon Key (first 20 chars):', SUPABASE_ANON_KEY?.substring(0, 20) + '...');
console.log('  Environment check:', process.env.NODE_ENV || 'development');

// Validate that environment variables are set
if (!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.warn('⚠️  SUPABASE_URL not configured. Please set EXPO_PUBLIC_SUPABASE_URL in your .env file');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️  SUPABASE_ANON_KEY not configured. Please set EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: async (key) => {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return AsyncStorage.getItem(key);
      },
      setItem: async (key, value) => {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return AsyncStorage.setItem(key, value);
      },
      removeItem: async (key) => {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return AsyncStorage.removeItem(key);
      },
    },
  },
  // Disable real-time completely to avoid WebSocket issues
  realtime: {
    disabled: true,
  },
  // Use REST API only
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-my-custom-header': 'MilkMatrix Mobile App',
    },
  },
});

// Test Supabase connection on app start
const testConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('⚠️  Supabase connection test - no users table or permission issue (this is expected):', error.message);
    } else {
      console.log('✅ Supabase connection test successful!');
    }
  } catch (networkError) {
    console.error('❌ Supabase connection test failed:', networkError.message);
  }
};

// Run connection test
testConnection();

// Auth service to match the web app structure
export const auth = {
  supabase,
  
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
  
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
  
  async signIn(email, password) {
    try {
      console.log('🔐 Attempting sign in for:', email);
      console.log('🌐 Supabase URL being used:', SUPABASE_URL);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Supabase auth error:', error);
        console.error('  - Error code:', error.status);
        console.error('  - Error message:', error.message);
        
        // Create a more user-friendly error message
        let userMessage = 'Login failed';
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Your email has not been verified. Please check your inbox.';
        } else if (error.message.includes('rate limit')) {
          userMessage = 'Too many login attempts. Please wait and try again later.';
        }
        
        return { 
          data: null, 
          error: { 
            ...error,
            message: userMessage,
            originalMessage: error.message
          }
        };
      } else {
        console.log('✅ Sign in successful');
        return { data, error };
      }
    } catch (networkError) {
      console.error('🚫 Network/Connection error during sign in:', networkError);
      console.error('  - Error name:', networkError.name);
      console.error('  - Error message:', networkError.message);
      console.error('  - Error stack:', networkError.stack);
      
      return { 
        data: null, 
        error: { 
          message: 'Network error: Unable to connect to the server. Please check your internet connection.',
          name: networkError.name,
          originalError: networkError
        } 
      };
    }
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
  
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },
};
