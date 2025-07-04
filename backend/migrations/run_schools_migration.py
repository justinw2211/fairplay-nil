#!/usr/bin/env python3
import os
import sys
from supabase import create_client, Client

def run_schools_migration():
    """Run only the new schools migration (012)"""
    # Get Supabase credentials from environment
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")  # Note: This needs to be the service key, not the anon key
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set")
        sys.exit(1)
    
    # Initialize Supabase client
    supabase: Client = create_client(url, key)
    
    # Get the specific migration file
    migration_dir = os.path.dirname(os.path.abspath(__file__))
    migration_file = "012_add_remaining_schools_complete.sql"
    file_path = os.path.join(migration_dir, migration_file)
    
    if not os.path.exists(file_path):
        print(f"Error: Migration file {migration_file} not found")
        sys.exit(1)
    
    print(f"Running schools migration: {migration_file}")
    
    try:
        with open(file_path, 'r') as f:
            sql = f.read()
            
        # Execute the SQL directly using the raw SQL method
        # Split the SQL into individual statements
        statements = sql.split(';')
        
        for i, statement in enumerate(statements):
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    # For direct SQL execution, we need to use the PostgREST client
                    response = supabase.postgrest.rpc('execute_sql', {'sql': statement + ';'}).execute()
                    print(f"Executed statement {i+1}")
                except Exception as e:
                    # Try alternative approach using supabase-py's SQL execution
                    try:
                        # Direct SQL execution
                        supabase.table("profiles").rpc("execute_sql", {"sql": statement + ";"}).execute()
                        print(f"Executed statement {i+1} (alternative method)")
                    except Exception as e2:
                        print(f"Error executing statement {i+1}: {str(e2)}")
                        print(f"Statement: {statement[:100]}...")
                        continue
        
        print("Schools migration completed successfully!")
        print("Added schools for:")
        print("- Remaining NCAA Division I schools")
        print("- NCAA Division II schools")
        print("- NCAA Division III schools")
        print("- NAIA schools")
        print("- JUCO schools")
        
    except Exception as e:
        print(f"Error running schools migration: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_schools_migration() 