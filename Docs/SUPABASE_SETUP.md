# Supabase Setup Guide for Dezective

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in with GitHub
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: `dezective`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to you (e.g., US West, EU West)
7. Click "Create new project"

## Step 2: Get Your Project Credentials

After your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## Step 3: Set Up Environment Variables

1. In your project root, create a `.env.local` file:

```bash
# Copy .env.local.example to .env.local
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the schema

## Step 5: Add Sample Data (Optional)

1. In SQL Editor, create another new query
2. Copy and paste the contents of `supabase/seed.sql`
3. Click "Run" to add sample data

## Step 6: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open the app and try:
   - Registering a new user
   - Logging in
   - Checking the leaderboard

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure `.env.local` exists and has the correct values
   - Restart your dev server after adding env vars

2. **"Database connection failed"**
   - Check your project URL and API key
   - Ensure your Supabase project is active

3. **"Row Level Security" errors**
   - The schema includes RLS policies
   - For development, you can disable RLS in Supabase dashboard

### Security Notes:

- The `anon` key is safe to use in frontend code
- Row Level Security (RLS) is enabled for production safety
- Never commit `.env.local` to version control

## Next Steps

Once Supabase is set up:
- Users can register and login
- Scores are saved to the database
- Global and level leaderboards work
- Progress is synced across devices
