# EventPulse — Claude Session State
> Read this at the start of every session. It tells you exactly where we are and what to do next.

---

## 🏗 Project Overview

**What it is:** A React/Vite event aggregation calendar for the Toronto/GTA area. Shows concerts, festivals, sports, theatre etc. from multiple APIs in a beautiful calendar + discovery feed UI.

**The goal:** Transform a static GitHub Pages demo into a real, live product with a real backend, real API data, and real users.

**Roadmap file:** `EventPulse_Roadmap.md` — 8 phases total. Follow in order. Stop at the end of each main task and confirm it works before moving on.

**GitHub repo:** `https://github.com/wetmud/eventpulse`

**Owner:** Jason (jason.steltman@gmail.com)

---

## 🖥 Tech Stack

| Layer | Service | Notes |
|-------|---------|-------|
| Frontend | **Vercel** | Auto-deploys from GitHub `main`. Live. |
| Backend | **Railway** | Node.js/Express. Root directory = `/server`. Running on port 3001. |
| Database | **Supabase** | PostgreSQL. Project ID: `jrdfcngdggqanjgxohjk`. Region: US East. |
| Cache | Upstash Redis | Not yet set up (Phase 1 stretch goal) |
| File storage | Supabase Storage | Not yet set up |

---

## 📍 Current Phase: Phase 2 — Real APIs (code complete, Railway config in progress)

### ✅ Phase 1 COMPLETE

**Step 1.1 — Stack chosen:** Vercel + Railway + Supabase

**Step 1.2 — Supabase project created and schema run:**
- Project URL: `https://jrdfcngdggqanjgxohjk.supabase.co`
- Tables created: `venues`, `events`, `profiles`, `saved_events`, `follows` + all indexes ✅

**Step 1.3 — Backend live on Railway:**
- Public URL: `https://eventpulse-production-0256.up.railway.app`
- Health check confirmed: `{"status":"ok"}` ✅
- All 15 environment variables set ✅

**Step 1.4 — Frontend live on Vercel:**
- URL: `https://eventpulse-ednedbs9o-wetmuds-projects.vercel.app`
- Auto-deploys from GitHub `main` ✅
- All 3 VITE env vars set (API URL, Supabase URL, Supabase anon key) ✅

**Step 1.5 — CORS locked down:**
- `FRONTEND_URL` in Railway set to the Vercel domain ✅

---

### 🟡 Phase 2 — Code Written, Needs Deploy + Sign-off

All Phase 2 files have been written and committed to GitHub via github.dev. Railway and Vercel will auto-deploy from `main`.

**Files added/modified for Phase 2:**

```
eventpulse/
├── package.json                      ← MODIFIED: added @tanstack/react-query ^5.28.0
├── src/
│   ├── main.jsx                      ← MODIFIED: wrapped app in QueryClientProvider
│   └── EventPulse.jsx                ← REWRITTEN: real API data via useQuery, dynamic month nav, loading skeleton, error banner
└── server/
    ├── index.js                      ← MODIFIED: added node-cron + syncAllSources every 6h
    ├── routes/
    │   └── admin.js                  ← MODIFIED: POST /sync now calls syncAllSources()
    └── services/
        ├── ticketmaster.js           ← NEW: fetches + normalizes GTA events from Ticketmaster API
        └── sync.js                   ← NEW: upserts venues + events into Supabase, deduplicates by source+source_id
```

**Key Phase 2 code notes:**
- `server/services/ticketmaster.js` — paginates all pages, 250ms rate-limit delay, exponential backoff on 429
- `server/services/sync.js` — `upsertVenue()` + `upsertEvents()` in batches of 50, `UNIQUE(source, source_id)` dedup
- Cron: `0 */6 * * *` (every 6 hours) in `server/index.js`
- Frontend: `useQuery(["events", year, month])` fetches `/api/events?month=X&year=Y&limit=500`
- `normalizeApiEvent()` maps Supabase fields → UI shape (event_date → day, start_time → time, venues.name → venue, etc.)
- Liked/notified stored as `Set` state, injected into events on each render (not persisted yet)
- Dynamic month/year navigation with rollover

**⚠️ Phase 2 sign-off still needed:**

**Step A — Fix Railway deploy (not yet stable):**
Railway kept trying to run `vite build` from the wrong directory. Correct settings:
- Root Directory: *(blank)*
- Build Command: `cd server && npm install`
- Start Command: `cd server && node index.js`

**Step B — Once Railway is green:**
1. Trigger manual sync: `POST https://eventpulse-production-0256.up.railway.app/api/admin/sync` with header `x-admin-key: [ADMIN_PASSWORD from Railway env vars]`
2. Verify events appear in Supabase Table Editor → `events` table
3. Verify frontend calendar at Vercel URL shows real events

---

## 📁 Full File Tree (Phase 1 + 2)

```
eventpulse/
├── CLAUDE.md                         ← THIS FILE
├── .env.example                      ← template for Vercel env vars
├── .gitignore
├── package.json                      ← root: vite + react + react-query
├── vite.config.js                    ← no base path (Vercel, not GitHub Pages)
├── index.html
├── src/
│   ├── main.jsx                      ← QueryClientProvider wrapper
│   ├── EventPulse.jsx                ← main app component (real API data)
│   └── lib/
│       └── supabase.js               ← Supabase JS client (VITE_ env vars)
└── server/
    ├── package.json                  ← ESM, Express, node-cron, etc.
    ├── index.js                      ← Express app + cron
    ├── .env.example
    ├── .gitignore
    ├── routes/
    │   ├── events.js                 ← GET /api/events, GET /api/events/:id, POST /api/events/submit
    │   ├── venues.js                 ← GET /api/venues, GET /api/venues/:id
    │   └── admin.js                  ← protected: pending, approve, reject, sync
    ├── middleware/
    │   ├── auth.js                   ← x-admin-key header check
    │   └── rateLimit.js              ← apiLimiter (200/15min), strictLimiter (20/min)
    └── services/
        ├── ticketmaster.js           ← Ticketmaster Discovery API fetcher
        └── sync.js                   ← Supabase upsert orchestrator
```

---

## 🔑 Environment Variables

### Railway (Backend) — all set
```
SUPABASE_URL=https://jrdfcngdggqanjgxohjk.supabase.co
SUPABASE_SERVICE_KEY=[service role JWT — in Railway]
TICKETMASTER_API_KEY=OTq1WeQGQGUDeVwf7Q3kCL5hyBTRxcKZ
PORT=3001
FRONTEND_URL=https://eventpulse-ednedbs9o-wetmuds-projects.vercel.app
ADMIN_PASSWORD=[in Railway — needed for x-admin-key header]
BANDSINTOWN_APP_ID=[placeholder]
MAPBOX_SECRET_TOKEN=[placeholder]
STRIPE_SECRET_KEY=[placeholder]
RESEND_API_KEY=[placeholder — needed for Phase 3]
ANTHROPIC_API_KEY=[placeholder — needed for Phase 6]
VAPID_PUBLIC_KEY=[placeholder — needed for Phase 7]
VAPID_PRIVATE_KEY=[placeholder — needed for Phase 7]
SONGKICK_API_KEY=[placeholder]
EVENTBRITE_API_KEY=[placeholder]
```

### Vercel (Frontend) — all set
```
VITE_API_URL=https://eventpulse-production-0256.up.railway.app
VITE_SUPABASE_URL=https://jrdfcngdggqanjgxohjk.supabase.co
VITE_SUPABASE_ANON_KEY=[in Vercel]
VITE_MAPBOX_TOKEN=[placeholder — needed for Phase 5]
VITE_VAPID_PUBLIC_KEY=[placeholder — needed for Phase 7]
VITE_STRIPE_PUBLIC_KEY=[placeholder — needed for Phase 8]
```

---

## 🗄 Supabase Schema

Tables: `venues`, `events`, `profiles`, `saved_events`, `follows`

Key field notes:
- `events.source` — where event came from: `'ticketmaster'`, `'eventbrite'`, `'user_submission'`, etc.
- `events.is_verified` — only `true` events returned by `/api/events` GET
- `events.source_id` — external API ID, used with `UNIQUE(source, source_id)` to prevent duplicates
- `profiles.id` — references `auth.users(id)` from Supabase Auth

---

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://eventpulse-ednedbs9o-wetmuds-projects.vercel.app |
| Backend (Railway) | https://eventpulse-production-0256.up.railway.app |
| Health check | https://eventpulse-production-0256.up.railway.app/api/health |
| Supabase dashboard | https://supabase.com/dashboard/project/jrdfcngdggqanjgxohjk |

---

## ⚠️ Known Issues / Gotchas

- **`npm install` won't run in the Claude VM** — Railway runs it at deploy time. Don't try to test the server locally from the VM.
- **Claude VM proxy blocks GitHub** — `git push` and SSH to github.com both fail. Use github.dev (browser VS Code) to commit files manually.
- **GitHub Actions deploy.yml** exists at `.github/workflows/deploy.yml` — old GitHub Pages deploy. May need to be disabled; Vercel handles deploys now.
- **vite.config.js** no longer has `base: '/eventpulse/'` — old GitHub Pages URL will break. Intentional.
- **`node-cron` must be in server/package.json** — confirm it's listed under dependencies before Railway deploys.
- **Admin sync endpoint** requires `x-admin-key` header matching `ADMIN_PASSWORD` env var in Railway.

---

## 📋 Roadmap Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Foundation | ✅ Complete | Railway + Vercel + Supabase all live |
| 2 — Real APIs | 🟡 Deploy pending | Code complete, needs sync trigger + verification |
| 3 — User Accounts | ⬜ Not started | Supabase Auth + profiles |
| 4 — User Submissions | ⬜ Not started | |
| 5 — Map View | ⬜ Not started | Need Mapbox token |
| 6 — Discovery Engine | ⬜ Not started | Needs ANTHROPIC_API_KEY |
| 7 — Mobile/PWA | ⬜ Not started | Needs VAPID keys |
| 8 — Monetization | ⬜ Not started | Needs Stripe keys |

---

## 🎨 UI Redesign — ✅ COMPLETE (March 14, 2026)

Committed: `feat: full UI redesign — light theme, hero, two-column layout`

**What shipped:**
- Full light warm-beige theme (`#f0ebe3`) throughout
- 100vh hero: nav + "Events, organized." headline + three category strips + venue poster image
- Stats strip: event count · venues · categories · sources + hot date chips + category pills
- Two-column main layout: sticky 380px calendar left, scrollable event list right
- DateBubble modal removed — date click filters the right list
- Discovery carousel removed — vertical event list replaces it
- Responsive: stacks below 900px

**Files changed:** `src/EventPulse.jsx`, `public/venues-poster.png`

---

## 🚀 Next Session Starting Point

### Priority 1 — Review + polish the redesign
Push to GitHub → Vercel auto-deploys. Then visually QA at:
`https://eventpulse-ednedbs9o-wetmuds-projects.vercel.app`

Things to check/polish next session:
- Hero image sizing on various screen sizes
- Calendar density colours on white — bump opacity if too faint
- Empty state when no events load (Phase 2 backend may not be syncing yet)
- `Sign in` button — wire up Supabase Auth (Phase 3)

### Priority 2 — Fix Railway deploy (Phase 2 sign-off)
Railway kept trying to run `vite build` from the wrong directory. Correct settings:
- Root Directory: *(blank)*
- Build Command: `cd server && npm install`
- Start Command: `cd server && node index.js`

Once Railway is green:
1. Trigger manual sync: `POST https://eventpulse-production-0256.up.railway.app/api/admin/sync` with header `x-admin-key: [ADMIN_PASSWORD from Railway env vars]`
2. Verify events appear in Supabase Table Editor → `events` table
3. Verify frontend calendar shows real events

### Priority 3 — Phase 3: User Accounts
- Supabase Auth (email + Google OAuth)
- Profile page
- Persist liked/notified events to `saved_events` table
- Show sign-in flow from the `Sign in` button in the hero nav

### Other ideas for future sessions
- **Search improvements** — debounce, clear button, highlight matching text
- **Event detail page/drawer** — clicking an event card opens a full details view
- **Share button** on event cards — Web Share API
- **"Add to calendar"** button — generates `.ics` file
- **Infinite scroll or pagination** on the event list (currently loads 500 at once)
- **Skeleton loading state** for event list (already have `CalendarSkeleton`, add `EventListSkeleton`)

---

*Last updated: 2026-03-14 — UI redesign shipped; Railway Phase 2 still pending*
