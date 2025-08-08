// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { getConfig } from './config/environment.js';

// Get Supabase configuration from centralized environment config
const supabaseConfig = getConfig().supabase;
let supabaseUrl = supabaseConfig?.url;
let supabaseAnonKey = supabaseConfig?.anonKey;

// Fallback to direct import.meta.env access if centralized config fails
if (!supabaseUrl && isProduction) {
  try {
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  } catch (e) {
    // Ignore error, will be handled by error handler
  }
}
if (!supabaseAnonKey && isProduction) {
  try {
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  } catch (e) {
    // Ignore error, will be handled by error handler
  }
}

// Environment detection for error handling
const isProduction = (() => {
  try {
    return import.meta.env.MODE === 'production';
  } catch {
    return false; // Default to development mode if import.meta.env is not available
  }
})();

// Graceful error handling that doesn't break the deployment pipeline
const handleSupabaseError = (variableName, value) => {
  if (!value) {
    const errorMessage = `${variableName} is not defined in the environment. Please set it in your Vercel project settings.`;
    
    // In production, try to get the value directly from import.meta.env as fallback
    if (isProduction) {
      try {
        const directValue = import.meta.env[variableName];
        if (directValue) {
          console.warn(`WARNING: Using direct import.meta.env access for ${variableName} in production`);
          return true;
        }
      } catch (e) {
        // Fall through to error
      }
      
      // If we still don't have a value, throw the error
      throw new Error(`FATAL: ${errorMessage}`);
    } else {
      // In development/staging, log warning but don't break the build
      console.warn(`WARNING: ${errorMessage}`);
      return false;
    }
  }
  return true;
};

// Validate Supabase configuration with graceful error handling
const isUrlValid = handleSupabaseError('VITE_SUPABASE_URL', supabaseUrl);
const isAnonKeyValid = handleSupabaseError('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);

// Create and export the Supabase client with fallback handling
let supabase = null;

if (isUrlValid && isAnonKeyValid) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    if (isProduction) {
      throw new Error(`FATAL: Failed to create Supabase client: ${error.message}`);
    } else {
      console.warn(`WARNING: Failed to create Supabase client: ${error.message}`);
    }
  }
} else if (!isProduction) {
  // In development, create a mock client to prevent build failures
  console.warn('WARNING: Using mock Supabase client for development');
  supabase = {
    auth: { getSession: () => Promise.resolve({ data: { session: null } }) },
    from: () => ({ select: () => Promise.resolve({ data: [] }) }),
    // Add other commonly used methods as needed
  };
}

export { supabase };