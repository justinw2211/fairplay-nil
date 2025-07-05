#!/usr/bin/env python3
"""
Script to apply analytics migration for dashboard support
Run this to add required fields for the analytics dashboard
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client

def load_migration(migration_file: str) -> str:
    """Load migration SQL from file"""
    migration_path = Path(__file__).parent / migration_file
    if not migration_path.exists():
        raise FileNotFoundError(f"Migration file not found: {migration_path}")
    
    with open(migration_path, 'r') as f:
        return f.read()

def apply_migration(supabase: Client, migration_sql: str) -> bool:
    """Apply migration SQL to database"""
    try:
        print("Applying analytics migration...")
        
        # Execute the migration SQL
        response = supabase.rpc('exec_sql', {'sql': migration_sql})
        
        print("✅ Analytics migration applied successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

def main():
    """Main function to run the migration"""
    print("=== Analytics Dashboard Migration ===")
    
    # Check environment variables
    url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url:
        print("❌ SUPABASE_URL environment variable not set")
        sys.exit(1)
    
    if not service_key:
        print("❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set")
        sys.exit(1)
    
    try:
        # Initialize Supabase client
        supabase = create_client(url, service_key)
        print("✅ Connected to Supabase")
        
        # Load and apply migration
        migration_sql = load_migration("017_add_analytics_fields.sql")
        success = apply_migration(supabase, migration_sql)
        
        if success:
            print("\n🎉 Analytics dashboard support is now ready!")
            print("\nNew fields added:")
            print("- brand_partner: For analytics partner tracking")
            print("- clearinghouse_result: For prediction accuracy tracking")
            print("- actual_compensation: For valuation accuracy tracking")
            print("- valuation_range: For easier analytics access")
            print("\nStatus values updated:")
            print("- Added 'active', 'completed', 'cancelled' statuses")
            print("- Existing 'approved' → 'active', 'rejected' → 'cancelled'")
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 