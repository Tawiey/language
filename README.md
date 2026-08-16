# PhraseDuel 🗣️⚔️

A warm, mobile-first web app that helps a couple learn each other's languages
(**Shona** and **Setswana**) through friendly competition. Live-synced across
both phones via Supabase.

## Features

- **Live scoreboard** — points per player, who's leading, and a 🔥 daily streak.
- **Shared phrase list** — English + a Shona and Setswana translation each.
  Both partners can add, edit, and delete; changes sync instantly.
- **Point actions** — `Used it` (+1, said a phrase unprompted), `Taught it`
  (+1, taught it clearly), and `−1` corrections, per player.
- **English Jar** 🫙 — tap to log when someone defaulted to English (a
  real-money penalty-jar counter).
- **Duel mode** — head-to-head flashcards: English shows, tap to reveal both
  translations, award the point to whoever got it right.
- **Live presence** — a status pill shows when you're *both* on the app
  together, with online dots on each player.
- **Voice notes** — record a spoken clip for each language on any phrase
  (stored in Supabase Storage as cross-platform WAV); play them back on the
  Phrases tab or during a Duel reveal. Run
  [`supabase/migration-voice-notes.sql`](supabase/migration-voice-notes.sql)
  once to enable.
- **Dark mode** — Light / Dark / Auto (follows the phone's system theme),
  chosen in Settings; warm palette in both.

## Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 14 (App Router) + TypeScript               |
| Styling    | Tailwind CSS — warm southern-African palette       |
| Fonts      | Fraunces (display serif) + Outfit (sans)           |
| Backend    | Supabase (Postgres + Realtime + Presence)          |
| Hosting    | Vercel                                             |

Shared state lives in Supabase — **not** browser localStorage — so both phones
see the same scores, phrases, and jar count in real time. A single shared
"household" row plus a passcode gate keeps access simple (no per-user auth).

## One-time setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql).
   It creates the tables, enables realtime, and seeds the 8 starter phrases.
   Edit the seed line to set your passcode, names, and languages.
3. From **Project Settings → API**, copy the **Project URL** and the
   **`anon` `public`** key.

### 2. Environment variables

Set these (the `anon` key is a public client key — safe to ship):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

For Vercel, add them under **Project → Settings → Environment Variables**, or
keep them in a committed `.env.production` (as this repo does).

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deployment (Vercel)

This repo is configured for zero-touch deploys:

- [`vercel.json`](vercel.json) pins the framework to **Next.js**.
- Pushes to **`main`** deploy to **production**.
- Pull requests get an automatic **Preview Deployment** — open the PR's
  *Visit Preview* link to test before merging.

**Vercel project settings** (set once on import):

- Framework Preset: **Next.js**
- Root Directory: repo root (`./`)
- Build / Output / Install commands: **defaults** (no overrides)

## Getting on it (both phones)

1. Open the live URL on each phone.
2. Enter the shared **passcode** (set in the seed SQL; change it in Settings).
3. Tap **Add to Home Screen** (iOS Safari) / **Install app** (Android Chrome).
4. On first open, pick **which partner** is holding that phone.
5. Set names and languages in **Settings**, then start duelling.
