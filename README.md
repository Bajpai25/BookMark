# Bookmark Manager

A modern, full-stack bookmark management application built with Next.js 14, Supabase, and Tailwind CSS. Features real-time synchronization, Google OAuth authentication, and a beautiful dark/light mode UI.

![Bookmark Manager](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)

## ✨ Features

- 🔐 **Secure Authentication** - Google OAuth via Supabase Auth
- ⚡ **Real-time Sync** - Instant updates across all tabs using Supabase Realtime
- 🎨 **Modern UI** - Clean, responsive design with dark/light mode
- 🔒 **Row Level Security** - Your bookmarks are private and secure
- 📱 **Responsive** - Works perfectly on mobile, tablet, and desktop
- 🚀 **Fast** - Built with Next.js 14 App Router for optimal performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up for free](https://supabase.com))
- A Google Cloud project for OAuth (we'll set this up below)

### 1. Clone and Install

```bash
cd bookmark-manager
npm install
```

### 2. Set Up Supabase

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy the contents of `supabase-schema.sql`
   - Paste and run it in the SQL Editor

3. **Get your credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon public` key

### 3. Configure Google OAuth

1. **In Supabase Dashboard**:
   - Go to Authentication → Providers
   - Enable Google provider
   - You'll see instructions for setting up Google OAuth

2. **In Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or select existing)
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret

3. **Back in Supabase**:
   - Paste the Google Client ID and Client Secret
   - Save the configuration

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
bookmark-manager/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts    # OAuth callback handler
│   │   ├── login/route.ts       # Login route
│   │   └── logout/route.ts      # Logout route
│   ├── dashboard/
│   │   ├── DashboardClient.tsx  # Dashboard UI component
│   │   └── page.tsx             # Dashboard page
│   ├── layout.tsx               # Root layout with ThemeProvider
│   └── page.tsx                 # Landing page
├── components/
│   ├── BookmarkList.tsx         # Real-time bookmark list
│   └── ThemeProvider.tsx        # Dark/light mode context
├── lib/
│   └── supabase/
│       ├── client.ts            # Client-side Supabase client
│       ├── server.ts            # Server-side Supabase client
│       └── middleware.ts        # Session refresh utility
├── middleware.ts                # Next.js middleware for auth
├── supabase-schema.sql          # Database schema with RLS
└── .env.local.example           # Environment variables template
```

## 🔧 How It Works

### Authentication Flow

1. User clicks "Login with Google" on landing page
2. Redirected to Google OAuth consent screen
3. After approval, redirected to `/auth/callback`
4. Session is created and user is redirected to `/dashboard`
5. Middleware protects dashboard routes

### Real-time Synchronization

The app uses Supabase Realtime to subscribe to database changes:

```typescript
// In BookmarkList.tsx
const channel = supabase
  .channel('bookmarks-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookmarks',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Update UI instantly
  })
  .subscribe()
```

### Row Level Security

All bookmarks are protected by RLS policies:

- Users can only SELECT their own bookmarks
- Users can only INSERT bookmarks with their own user_id
- Users can only DELETE their own bookmarks

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    },
  },
}
```

### Adding Features

Some ideas for extending the app:

- 📂 Folders/categories for bookmarks
- 🏷️ Tags for better organization
- 🔍 Search functionality
- 📊 Analytics and statistics
- 📤 Import/export bookmarks
- 🌐 Browser extension

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URI to include your Vercel domain
5. Deploy!

### Update Supabase Redirect URL

After deployment, update the redirect URL in your Google OAuth settings to include your production domain.

## 📝 Database Schema

```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL
);
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Lucide React](https://lucide.dev) - Beautiful icons

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or [Next.js documentation](https://nextjs.org/docs).
