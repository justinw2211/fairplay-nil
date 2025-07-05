// frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Securely load the environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add robust error checking to fail fast with clear errors.
if (!supabaseUrl) {
  throw new Error("FATAL: VITE_SUPABASE_URL is not defined in the environment. Please set it in your Vercel project settings.");
}
if (!supabaseAnonKey) {
  throw new Error("FATAL: VITE_SUPABASE_ANON_KEY is not defined in the environment. Please set it in your Vercel project settings.");
}

// Create and export the Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);