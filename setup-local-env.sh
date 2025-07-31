#!/bin/bash

echo "🔧 Setting up local environment variables..."

# Check if .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo "❌ .env.local not found. Creating it..."
    cp frontend/.env.development frontend/.env.local
fi

# Add Supabase URL if not already present
if ! grep -q "VITE_SUPABASE_URL" frontend/.env.local; then
    echo "📝 Adding VITE_SUPABASE_URL..."
    echo "" >> frontend/.env.local
    echo "# Supabase Configuration (for local development)" >> frontend/.env.local
    echo "VITE_SUPABASE_URL=https://izitucbtlygkzncwmsjl.supabase.co" >> frontend/.env.local
fi

# Check if VITE_SUPABASE_ANON_KEY is present
if ! grep -q "VITE_SUPABASE_ANON_KEY" frontend/.env.local; then
    echo ""
    echo "⚠️  VITE_SUPABASE_ANON_KEY is missing!"
    echo ""
    echo "To get your Supabase anon key:"
    echo "1. Go to your Vercel project settings"
    echo "2. Find VITE_SUPABASE_ANON_KEY"
    echo "3. Copy the value"
    echo "4. Add it to frontend/.env.local:"
    echo ""
    echo "VITE_SUPABASE_ANON_KEY=your_key_here"
    echo ""
    echo "Or run this command:"
    echo "echo 'VITE_SUPABASE_ANON_KEY=your_key_here' >> frontend/.env.local"
    echo ""
else
    echo "✅ VITE_SUPABASE_ANON_KEY is already set"
fi

echo ""
echo "📋 Current .env.local contents:"
echo "----------------------------------------"
cat frontend/.env.local
echo "----------------------------------------"

echo ""
echo "🚀 To start local development:"
echo "1. Add VITE_SUPABASE_ANON_KEY to .env.local"
echo "2. Run: ./start-local-dev.sh"
echo "3. Or manually: npm run dev (in frontend/)" 