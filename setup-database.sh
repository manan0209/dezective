#!/bin/bash

# Dezective Database Setup Script
# This script helps set up the Supabase database schema

echo "🎮 Dezective Database Setup"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your Supabase credentials."
    exit 1
fi

# Source the environment variables
source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set in .env.local"
    exit 1
fi

echo "✅ Environment variables found"
echo "📊 Supabase URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

echo "📋 Next steps to complete setup:"
echo ""
echo "1. Open your Supabase Dashboard:"
echo "   👉 ${NEXT_PUBLIC_SUPABASE_URL/https:\/\//https://app.supabase.com/project/}"
echo ""
echo "2. Go to SQL Editor"
echo ""
echo "3. Create a new query and run the schema:"
echo "   📁 Copy contents from: supabase/schema.sql"
echo ""
echo "4. (Optional) Add sample data:"
echo "   📁 Copy contents from: supabase/seed.sql"
echo ""
echo "5. Test the connection in the app:"
echo "   🌐 http://localhost:3000"
echo "   - Try registering a new user"
echo "   - Check the leaderboard"
echo ""

# Open Supabase dashboard
if command -v open >/dev/null 2>&1; then
    echo "🚀 Opening Supabase Dashboard..."
    open "${NEXT_PUBLIC_SUPABASE_URL/https:\/\//https://app.supabase.com/project/}"
else
    echo "💡 Manually open: ${NEXT_PUBLIC_SUPABASE_URL/https:\/\//https://app.supabase.com/project/}"
fi
