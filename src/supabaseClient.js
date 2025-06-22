// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Make sure these are the correct values from your Supabase project settings
const supabaseUrl = 'YOUR_SUPABASE_URL'; 
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);