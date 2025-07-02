import os
import sys
from supabase import create_client, Client

def run_migrations():
    # Get Supabase credentials from environment
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")  # Note: This needs to be the service key, not the anon key
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set")
        sys.exit(1)
    
    # Initialize Supabase client
    supabase: Client = create_client(url, key)
    
    # Get all .sql files in the migrations directory
    migration_dir = os.path.dirname(os.path.abspath(__file__))
    migration_files = sorted([f for f in os.listdir(migration_dir) if f.endswith('.sql')])
    
    print(f"Found {len(migration_files)} migration files")
    
    # Run each migration file
    for file_name in migration_files:
        print(f"\nRunning migration: {file_name}")
        file_path = os.path.join(migration_dir, file_name)
        
        try:
            with open(file_path, 'r') as f:
                sql = f.read()
                
            # Execute the SQL
            result = supabase.table("profiles").rpc("run_migration", {"sql": sql}).execute()
            print(f"Successfully ran migration: {file_name}")
            
        except Exception as e:
            print(f"Error running migration {file_name}: {str(e)}")
            sys.exit(1)
    
    print("\nAll migrations completed successfully!")

if __name__ == "__main__":
    run_migrations() 