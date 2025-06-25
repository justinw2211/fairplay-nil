# backend/app/db.py
import os
from supabase import create_client, Client

# --- Step 1: Securely load credentials from the environment ---
# This code reads the variables set in the Render dashboard.
url = os.environ.get("SUPABASE_URL")
# *** BUG FIX: This now looks for the variable name that exists in your Render settings. ***
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") 

# --- Step 2: Add robust error checking ---
# This will stop the app immediately with a clear error if a variable is missing.
if not url:
    raise ValueError("FATAL: SUPABASE_URL environment variable is not set.")
if not key:
    # This error message now correctly reflects the variable name it's looking for.
    raise ValueError("FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.")

# --- Step 3: Create the Supabase client ---
# This line will only run if the URL and Key were found successfully.
supabase: Client = create_client(url, key)