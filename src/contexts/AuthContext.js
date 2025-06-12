import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/supabase';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount and subscription to auth changes
  useEffect(() => {
    // Get the current session
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Get the current session and user
        const { session } = await auth.getSession();
        
        if (session) {
          const { user: currentUser } = await auth.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Call check user initially
    checkUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = auth.supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          checkUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Cleanup subscription
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await auth.signIn(email, password);
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Provide auth context value
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
