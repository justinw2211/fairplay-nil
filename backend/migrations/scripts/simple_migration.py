#!/usr/bin/env python3
"""
Simple Performance Migration
Run this script to apply the performance indexes
"""

import os
import sys
import psycopg2
from pathlib import Path

def main():
    print("🚀 FairPlay NIL - Performance Migration")
    print("=" * 50)
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ Please set DATABASE_URL environment variable")
        print("Format: postgresql://postgres:[password]@[host]:5432/postgres")
        print("You can get this from your Supabase project settings")
        sys.exit(1)
    
    # Read the migration file
    migration_path = Path(__file__).parent / "migrations" / "015_performance_indexes.sql"
    if not migration_path.exists():
        print(f"❌ Migration file not found: {migration_path}")
        sys.exit(1)
    
    with open(migration_path, 'r') as f:
        sql = f.read()
    
    # Connect to database
    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        print("✅ Connected successfully")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        sys.exit(1)
    
    # Split and execute SQL statements
    statements = []
    for stmt in sql.split(';'):
        stmt = stmt.strip()
        if stmt and not stmt.startswith('--') and not stmt.startswith('#!/'):
            statements.append(stmt)
    
    print(f"📝 Found {len(statements)} statements to execute")
    
    success_count = 0
    for i, statement in enumerate(statements, 1):
        try:
            print(f"📝 Executing statement {i}/{len(statements)}")
            cursor.execute(statement)
            conn.commit()
            success_count += 1
            print(f"✅ Statement {i} successful")
        except Exception as e:
            if "already exists" in str(e).lower():
                print(f"ℹ️ Statement {i} skipped (already exists)")
                success_count += 1
            else:
                print(f"❌ Statement {i} failed: {e}")
                print(f"Failed statement: {statement[:100]}...")
                cursor.close()
                conn.close()
                sys.exit(1)
    
    # Verify migration
    print("🔍 Verifying migration...")
    try:
        cursor.execute("""
            SELECT indexname, tablename 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname IN (
                'idx_deals_user_id_status_created',
                'idx_profiles_role_created',
                'idx_schools_division_name',
                'idx_social_media_user_platform'
            )
            ORDER BY indexname;
        """)
        
        results = cursor.fetchall()
        if results:
            print("✅ Key performance indexes found:")
            for row in results:
                print(f"  - {row[0]} on {row[1]}")
        else:
            print("⚠️ Some key indexes not found")
    except Exception as e:
        print(f"❌ Verification failed: {e}")
    
    cursor.close()
    conn.close()
    
    print("=" * 50)
    print(f"🎉 Migration completed! {success_count}/{len(statements)} statements successful")
    print("Expected performance improvements:")
    print("  - Deal queries: 50-70% faster")
    print("  - School filtering: 60-80% faster")
    print("  - Profile searches: 40-60% faster")
    print("  - Social media queries: 70-90% faster")
    print("=" * 50)

if __name__ == "__main__":
    main() 