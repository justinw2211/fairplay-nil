// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { getConfig } from './config/environment.js';

// Get Supabase configuration from centralized environment config
const supabaseConfig = getConfig().supabase;
const supabaseUrl = supabaseConfig?.url;
const supabaseAnonKey = supabaseConfig?.anonKey;

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
    
    // Only throw fatal errors in production, not during build or development
    if (isProduction) {
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