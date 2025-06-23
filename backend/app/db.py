import os
from supabase import create_client, Client

# --- Step 1: Securely load credentials from the environment ---
# This code reads the variables set in the Render dashboard.
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY") # This now correctly matches the Render variable name

# --- Step 2: Add robust error checking ---
# This will stop the app immediately with a clear error if a variable is missing.
if not url:
    raise ValueError("FATAL: SUPABASE_URL environment variable is not set.")
if not key:
    raise ValueError("FATAL: SUPABASE_SERVICE_KEY environment variable is not set.")

# --- Step 3: Create the Supabase client ---
# This line will only run if the URL and Key were found successfully.
supabase: Client = create_client(url, key)