# 🚀 Quick Setup Guide

Follow these steps to get your Bookmark Manager up and running in minutes!

## Step 1: Install Dependencies ✅

Dependencies are already installed! The project includes:
- Next.js 14 with App Router
- Supabase client libraries (`@supabase/supabase-js`, `@supabase/ssr`)
- Tailwind CSS for styling
- Lucide React for icons

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: bookmark-manager (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you
4. Click "Create new project" and wait ~2 minutes for setup

## Step 3: Set Up Database

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

You should see: "Success. No rows returned"

This creates:
- ✅ `bookmarks` table with proper structure
- ✅ Row Level Security (RLS) policies
- ✅ Realtime subscription enabled

## Step 4: Configure Google OAuth

### In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google** to ON
4. Keep this tab open - you'll need to paste credentials here

### In Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project or select existing one
3. In the search bar, type "OAuth consent screen" and select it
4. Configure consent screen:
   - User Type: **External**
   - App name: **Bookmark Manager**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all steps

5. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Name: **Bookmark Manager**
8. **Authorized redirect URIs** - Add this URL:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   Replace `<your-project-ref>` with your actual Supabase project reference (found in your Supabase project URL)

9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

### Back in Supabase:

1. Paste the **Client ID** into the Google provider settings
2. Paste the **Client Secret**
3. Click **Save**

## Step 5: Set Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in your editor

3. Get your Supabase credentials:
   - In Supabase, go to **Project Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key

4. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 6: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## ✅ Verification Checklist

Test these features to ensure everything works:

- [ ] Landing page loads with "Login with Google" button
- [ ] Clicking login redirects to Google OAuth
- [ ] After login, redirected to `/dashboard`
- [ ] Can add a bookmark (URL + Title)
- [ ] Bookmark appears instantly in the list
- [ ] Can delete a bookmark
- [ ] Open dashboard in two tabs:
  - [ ] Add bookmark in tab 1 → appears in tab 2 instantly
  - [ ] Delete bookmark in tab 2 → disappears in tab 1 instantly
- [ ] Dark/light mode toggle works
- [ ] Logout button works

## 🎉 You're Done!

Your Bookmark Manager is now fully functional with:
- ✅ Secure Google authentication
- ✅ Real-time synchronization
- ✅ Private, secure bookmarks (RLS)
- ✅ Beautiful dark/light mode UI

## 🚀 Next Steps

- Deploy to Vercel (see README.md)
- Customize colors in `tailwind.config.ts`
- Add more features (tags, folders, search)

## 🆘 Troubleshooting

**Login doesn't work:**
- Check that Google OAuth is enabled in Supabase
- Verify redirect URI matches exactly in Google Cloud Console
- Check browser console for errors

**Bookmarks don't appear:**
- Verify the SQL schema was run successfully
- Check Supabase Table Editor to see if bookmarks table exists
- Check browser console for errors

**Real-time doesn't work:**
- Ensure Realtime is enabled in Supabase (Project Settings → API → Realtime)
- Verify the SQL schema includes the Realtime publication line

**Build errors:**
- Make sure `.env.local` exists with correct values
- Run `npm install` again
- Delete `.next` folder and rebuild
