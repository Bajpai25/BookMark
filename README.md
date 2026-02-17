# Bookmark Manager

A real-time bookmark manager built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.  
Google OAuth login, instant cross-tab sync, and a clean UI — deployed on Vercel.

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) project
- Google OAuth credentials ([setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google))

### Install & Run

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

### Database Setup

Run `supabase-schema.sql` in **Supabase → SQL Editor**. This creates the `bookmarks` table with Row Level Security — users can only access their own data.

---

## Deploying to Vercel

1. Push to GitHub → Import in [Vercel](https://vercel.com)
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel environment variables
3. Deploy

**No need to set `NEXT_PUBLIC_SITE_URL`** — the app detects its own origin dynamically (see below).

---

## Challenges & Solutions

### 1. Redirect URL Breaking on Every Deploy

**Problem:** On Vercel's free plan without a custom domain, the deployment URL changes on every push. Setting `NEXT_PUBLIC_SITE_URL` as an env variable doesn't work because it goes stale immediately.

**Fix:** Instead of relying on an env variable, the login route reads the origin straight from the incoming request headers:

```ts
// app/auth/login/route.ts
const headersList = await headers()
const host = headersList.get('x-forwarded-host') || headersList.get('host')
const protocol = headersList.get('x-forwarded-proto') || 'http'
const origin = `${protocol}://${host}`
```

Vercel sets `x-forwarded-host` and `x-forwarded-proto` automatically, so the redirect URL always matches the current deployment — zero config needed.

**Also important:** In **Supabase → Authentication → URL Configuration**, add a wildcard redirect URL:

```
https://*.vercel.app/auth/callback
```

This allows any Vercel deployment URL to complete the OAuth flow.

---

### 2. Cookie-Based Auth with Supabase SSR

**Problem:** Supabase's default JS client stores the session in `localStorage`, which is invisible to the server. This means server-side route protection and `getUser()` calls don't work — the server thinks the user is logged out.

**Fix:** We use `@supabase/ssr` which stores the auth session in **HTTP cookies** instead. The middleware refreshes the session on every request:

```
middleware.ts → lib/supabase/middleware.ts → refreshes cookies per-request
```

This is what makes `getUser()` work in server components and route handlers. **Without this middleware, every server-side auth check would fail.**

The auth callback (`app/auth/callback/route.ts`) exchanges the OAuth code for a session and stores it in cookies via `exchangeCodeForSession()`.

---

### 3. Real-Time Cross-Tab Sync with BroadcastChannel

**Problem:** Supabase Realtime requires enabling replication on the table (Supabase Dashboard → Database → Replication), and even then it depends on a persistent WebSocket connection. If Realtime isn't configured, adding a bookmark in one tab won't show up in another tab.

**Fix:** We use the browser's [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) API as a lightweight cross-tab messaging layer. When a bookmark is added or deleted, the active tab broadcasts a message:

```ts
const bc = new BroadcastChannel('bookmarks-sync')
bc.postMessage('changed')
bc.close()
```

Other tabs listen on the same channel and re-fetch the bookmark list:

```ts
const bc = new BroadcastChannel('bookmarks-sync')
bc.onmessage = () => fetchBookmarks()
```

This works instantly within the same browser, no server roundtrip, no WebSocket, no Supabase Realtime required. The Supabase Realtime subscription is still in the code as a bonus for cross-device sync (if enabled).

---

## Tech Stack

| Layer          | Technology                |
|----------------|---------------------------|
| Framework      | Next.js 14 (App Router)   |
| Auth & DB      | Supabase (OAuth + Postgres) |
| Styling        | Tailwind CSS              |
| Auth Strategy  | `@supabase/ssr` (cookies) |
| Cross-Tab Sync | BroadcastChannel API      |
| Hosting        | Vercel                    |

---

## Project Structure

```
app/
├── auth/
│   ├── callback/route.ts     # exchanges OAuth code for session
│   ├── login/route.ts        # initiates Google OAuth (dynamic origin)
│   └── logout/route.ts       # clears session
├── dashboard/
│   ├── DashboardClient.tsx   # form + bookmark list + broadcast
│   └── page.tsx              # server component (auth gate)
├── layout.tsx                # root layout
└── page.tsx                  # landing page
components/
└── BookmarkList.tsx           # real-time list + BroadcastChannel listener
lib/supabase/
├── client.ts                  # browser Supabase client
├── server.ts                  # server Supabase client
└── middleware.ts              # cookie-based session refresh
middleware.ts                  # Next.js middleware (runs on every request)
```

---

## License

MIT
