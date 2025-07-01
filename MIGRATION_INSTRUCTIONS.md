# Database Migration Instructions

## Problem
The signup process is failing with "Database error saving new user" because the required database schema hasn't been applied to your Supabase project.

## Solution
You need to manually apply the migration SQL to your Supabase database. Follow these steps:

### Step 1: Access Supabase Studio
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (the one with URL: `https://qwppcchjyqkanwwcpmaq.supabase.co`)

### Step 2: Open SQL Editor
1. In the left sidebar, click on "SQL Editor"
2. Click "New query" to create a new SQL query

### Step 3: Copy and Execute Migration SQL
Copy the entire contents of `supabase/migrations/20250701073234_curly_base.sql` and paste it into the SQL editor, then click "Run".

The migration will:
- Create the `profiles` table with proper structure
- Set up Row Level Security (RLS) policies
- Create necessary indexes
- Set up triggers for automatic profile creation
- Configure the `workflows` table properly

### Step 4: Verify Setup
After running the migration:

1. **Check Tables**: Go to "Table Editor" in the sidebar and verify:
   - `profiles` table exists with columns: `id`, `username`, `bio`, `website`, `location`, `created_at`, `updated_at`
   - `workflows` table has the `user_id` column

2. **Check Policies**: Go to "Authentication" → "Policies" and verify:
   - `profiles` table has policies for SELECT, INSERT, and UPDATE
   - `workflows` table has policies for all operations (SELECT, INSERT, UPDATE, DELETE)

3. **Test Signup**: Return to your application and try signing up again

### Step 5: Enable Email Confirmation (Optional)
If you want to disable email confirmation for easier testing:
1. Go to "Authentication" → "Settings"
2. Under "User Signups", toggle off "Enable email confirmations"

## Migration SQL Content
The migration file contains all the necessary SQL to set up your database schema. It's designed to be safe to run multiple times (idempotent) and will only create what doesn't already exist.

## Troubleshooting
If you still encounter issues after applying the migration:

1. **Check Environment Variables**: Ensure your `.env` file has the correct Supabase URL and anon key
2. **Verify RLS Policies**: Make sure the policies allow authenticated users to insert their own profiles
3. **Check Browser Console**: Look for any additional error messages that might provide more context

Once the migration is applied successfully, the signup process should work correctly.