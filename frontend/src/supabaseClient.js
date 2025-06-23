// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// This code securely reads the environment variables you just set in Vercel.
// The `import.meta.env` object is how Vite exposes environment variables to your frontend.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the variables are loaded correctly
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);