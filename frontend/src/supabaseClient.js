// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Securely load the environment variables using centralized configuration.
const getEnvVar = (key) => {
  try {
    return import.meta?.env?.[key];
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Add robust error checking to fail fast with clear errors.
if (!supabaseUrl) {
  throw new Error("FATAL: VITE_SUPABASE_URL is not defined in the environment. Please set it in your Vercel project settings.");
}
if (!supabaseAnonKey) {
  throw new Error("FATAL: VITE_SUPABASE_ANON_KEY is not defined in the environment. Please set it in your Vercel project settings.");
}

// Create and export the Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);