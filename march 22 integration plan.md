# EventPulse Integration Plan — March 22, 2026

GSD manages phases. Agency-agents specialize tasks within phases. Checkpoints gate advancement. Nothing advances until verified.

---

## 1. Overview & Philosophy

EventPulse has eight phases. Each phase is a self-contained unit of work with a hard gate at the end. Two systems orchestrate the work:

- **GSD** (Get Shit Done) — phase-level workflow. Plans the phase, executes it, verifies it, ships it.
- **agency-agents** — task-level specialization. The right persona handles the right work inside each phase.

These nest together in a two-tier loop:

```
┌─────────────────────────────────────────────────────┐
│  GSD PHASE LOOP (outer)                             │
│                                                     │
│  /gsd:discuss-phase  ──►  /gsd:plan-phase           │
│         │                       │                   │
│         │              ┌────────▼────────┐          │
│         │              │ TASK LOOP (inner)│          │
│         │              │                  │          │
│         │              │  Agent executes  │          │
│         │              │       │          │          │
│         │              │  EvidenceQA      │          │
│         │              │  validates       │          │
│         │              │       │          │          │
│         │              │  PASS? ──► next  │          │
│         │              │  FAIL? ──► retry │          │
│         │              │  (max 3x)       │          │
│         │              └────────┬────────┘          │
│         │                       │                   │
│  /gsd:verify-work  ◄───────────┘                    │
│         │                                           │
│  CHECKPOINT: all criteria pass?                     │
│    YES ──► /gsd:ship ──► next phase                 │
│    NO  ──► /gsd:debug ──► fix ──► re-verify         │
└─────────────────────────────────────────────────────┘
```

The inner loop (EvidenceQA per task) catches bugs at the unit level. The outer loop (GSD verify-work per phase) catches integration issues. Nothing ships with unverified work.

---

## 2. Setup: Install & Configure

### 2.1 agency-agents

Agents should already be at `~/.claude/agents/`. Verify:

```bash
ls ~/.claude/agents/
```

If missing, install from your agency-agents repo:

```bash
cp -r /path/to/agency-agents/* ~/.claude/agents/
```

**Agents used in this project** (by phase):

| Agent | Used In | Role |
|-------|---------|------|
| `devops-engineer` | P2 | Railway config, deploy fixes |
| `backend-developer` | P2, P3, P4, P6 | API routes, sync service, cron |
| `database-architect` | P2, P3, P4, P6 | Schema migrations, RLS policies |
| `frontend-developer` | P2, P3, P4, P5, P7 | React components, state management |
| `security-engineer` | P3 | Auth flows, RLS, input validation |
| `ArchitectUX` | P3, P4, P5 | Design system, layout architecture |
| `ui-designer` | P3, P5, P7 | Visual polish, responsive design |
| `full-stack-developer` | P4 | End-to-end submission flow |
| `ai-engineer` | P6 | Claude API integration, prompts |
| `performance-engineer` | P7 | Lighthouse, caching, SW |
| `mobile-developer` | P7 | PWA manifest, push notifications |
| `project-manager-senior` | All | Task list generation from specs |
| `EvidenceQA` | All | Per-task screenshot validation |
| `testing-reality-checker` | All | End-of-phase integration check |

### 2.2 GSD

GSD is a Claude Code skill set (already installed). Initialize the planning directory:

```bash
mkdir -p /Users/macintosh/Documents/GitHub/eventpulse/.planning
```

GSD will create `PLAN.md` and state files inside `.planning/` for each phase.

### 2.3 Activating an Agent

Paste this pattern at the start of a Claude Code session:

```
Activate [agent-name] mode. You are working on EventPulse, a React/Vite + Node.js/Express + Supabase event aggregation app for Toronto/GTA.

Current phase: [X]
Task: [description]
Relevant files: [list]

Read CLAUDE.md and .planning/PLAN.md for full context.
```

Example:

```
Activate backend-developer mode. You are working on EventPulse.

Current phase: 2
Task: Add city column to events table and fix sync service to populate it
Relevant files: server/services/sync.js, server/services/ticketmaster.js, server/routes/events.js

Read CLAUDE.md and .planning/PLAN.md for full context.
```

---

## 3. The Master Launch Command

Paste this into Claude Code to trigger full orchestrator mode for any phase:

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md and /Users/macintosh/Documents/GitHub/eventpulse/.planning/PLAN.md.

You are running the EventPulse orchestrator for Phase [X]: [Phase Name].

Pipeline:
1. project-manager-senior reads the phase spec below and outputs a numbered task list
2. ArchitectUX reviews the task list and flags any architecture decisions needed
3. For each task: activate the assigned agent, execute, then EvidenceQA validates (PASS/FAIL, max 3 retries, then escalate)
4. After all tasks pass: testing-reality-checker runs final integration check
5. If integration passes: /gsd:ship

Phase [X] spec:
[Paste the phase section from this document]

Agent assignments:
[Paste the agent roster from this document]

Begin with step 1. Output the task list before executing anything.
```

For simpler sessions (single task, not full orchestrator):

```
/gsd:execute-phase

Phase: [X]
Task: [specific task number from PLAN.md]
Agent: [assigned agent]
```

---

## 4. Phase-by-Phase Blueprint

---

### PHASE 2: Real APIs (Fix + Complete)

**Goal:** Get real Ticketmaster events flowing into Supabase and displaying on the frontend calendar.

**Prerequisites:** Phase 1 complete. Railway, Vercel, Supabase all reachable.

**Agent Roster:**

| Task | Agent |
|------|-------|
| Railway deploy config fix | `devops-engineer` |
| Schema migration (city column, sync_runs) | `database-architect` |
| Sync service fix + city population | `backend-developer` |
| Frontend price bug + hero stats | `frontend-developer` |
| localStorage likes fallback | `frontend-developer` |

**GSD Commands:**

```
/gsd:discuss-phase    # Context: Phase 2 is broken. Railway config, city filter, price display.
/gsd:plan-phase       # Generates PLAN.md with task breakdown
/gsd:execute-phase    # Runs tasks with agent assignments
/gsd:verify-work      # Validates all criteria below
/gsd:ship             # PR + merge
```

**Task Breakdown:**

**Task 2.1: Fix Railway deploy config** (`devops-engineer`)
- Railway settings: Root Directory = blank, Build = `cd server && npm install`, Start = `cd server && node index.js`
- Verify health endpoint returns 200

**Task 2.2: Add `city` column to `events` table** (`database-architect`)

Run in Supabase SQL Editor (`https://supabase.com/dashboard/project/jrdfcngdggqanjgxohjk/sql`):

```sql
-- Add city directly on events for fast filtering
ALTER TABLE events ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Toronto';

-- Create index for city filtering
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);

-- Create sync_runs table for pipeline observability
CREATE TABLE IF NOT EXISTS sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  events_fetched INTEGER DEFAULT 0,
  events_upserted INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_runs_source ON sync_runs(source, started_at DESC);
```

**Task 2.3: Update sync service to populate `city`** (`backend-developer`)
- In `server/services/ticketmaster.js`: add `city` to the normalized event object (from `venue.city?.name || 'Toronto'`)
- In `server/services/sync.js`: include `city` in the upsert payload
- In `server/services/sync.js`: write sync run records to `sync_runs` table (start, end, counts, status)

**Task 2.4: Fix events route city filter** (`backend-developer`)
- In `server/routes/events.js`: replace `.eq('venues.city', city)` with `.eq('city', city)` (direct column, no join)
- This fixes the silent join bug where the filter was applied on the joined venues relation and silently returned no results for some queries

**Task 2.5: Fix `$undefined-$undefined` price display** (`frontend-developer`)
- In `EventPulse.jsx` line ~156: the price display shows `$undefined-$undefined` when `priceMin` or `priceMax` is null
- Fix: only render the price span when both values are non-null, or show "Free" when both are null/0

**Task 2.6: Replace hardcoded hero stats** (`frontend-developer`)
- Compute from `allEvents` array: total events count, unique venues count, unique sources count
- Replace hardcoded values in the hero section

**Task 2.7: Add localStorage fallback for likes/notifies** (`frontend-developer`)
- On like/notify toggle: persist to `localStorage` under keys `ep_liked` and `ep_notified` (JSON arrays of event IDs)
- On app load: initialize `liked` and `notified` Sets from localStorage
- Phase 3 will migrate this to Supabase `saved_events`

**Task 2.8: Trigger initial sync and verify data** (`devops-engineer`)

```bash
curl -X POST https://eventpulse-production-0256.up.railway.app/api/admin/sync \
  -H "x-admin-key: YOUR_ADMIN_PASSWORD" \
  -H "Content-Type: application/json"
```

---

> ### **CHECKPOINT [Phase 2]**
>
> - [ ] `curl https://eventpulse-production-0256.up.railway.app/api/health` returns `{"status":"ok",...}`
> - [ ] `curl https://eventpulse-production-0256.up.railway.app/api/events?month=4&year=2026&limit=5` returns JSON with `events` array length > 0, each event has a non-null `city` field
> - [ ] Supabase dashboard (`jrdfcngdggqanjgxohjk`) > Table Editor > `events` table has > 0 rows with `is_verified = true`
> - [ ] Supabase > `sync_runs` table has at least 1 row with `status = 'complete'`
> - [ ] Frontend at `https://eventpulse-ednedbs9o-wetmuds-projects.vercel.app` shows real event names on the calendar (not demo data), price displays correctly (no `$undefined`), hero stats reflect real counts
> - [ ] Like an event, refresh the page, the heart is still filled (localStorage persistence)
>
> **Hard gate:** Do not proceed to Phase 3 until all criteria pass.
>
> **On failure:**
> - Railway 502/503: `activate devops-engineer` + `/gsd:debug` — check Railway logs, verify build/start commands
> - Empty events array: `activate backend-developer` + check Ticketmaster API response manually: `curl "https://app.ticketmaster.com/discovery/v2/events.json?apikey=OTq1WeQGQGUDeVwf7Q3kCL5hyBTRxcKZ&city=Toronto&countryCode=CA&size=5"`
> - City filter returning empty: verify `events.city` column exists and is populated in Supabase

---

### PHASE 3: User Accounts

**Goal:** Users can sign up, log in, save events, and follow artists/venues with data persisted to Supabase.

**Prerequisites:** Phase 2 checkpoint passed. Real events loading. localStorage likes working.

**Agent Roster:**

| Task | Agent |
|------|-------|
| Supabase Auth config | `security-engineer` |
| Auth hook + Zustand store | `frontend-developer` + `security-engineer` |
| AuthModal component | `frontend-developer` + `ArchitectUX` |
| Profile page | `frontend-developer` + `ui-designer` |
| Migrate likes to saved_events | `backend-developer` + `frontend-developer` |
| RLS policies | `database-architect` + `security-engineer` |
| Follow system | `full-stack-developer` |

**GSD Commands:**

```
/gsd:discuss-phase
/gsd:plan-phase
/gsd:execute-phase
/gsd:verify-work
/gsd:ship
```

**Task Breakdown:**

**Task 3.1: Configure Supabase Auth** (`security-engineer`)
- Enable Email auth in Supabase dashboard > Authentication > Providers
- Enable Google OAuth (requires Google Cloud Console OAuth credentials)
- Set redirect URL to Vercel frontend URL
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel env vars (already done per CLAUDE.md)

**Task 3.2: Create Supabase client in frontend** (`frontend-developer`)
- File exists at `src/lib/supabase.js` — verify it uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Add auth state listener: `supabase.auth.onAuthStateChange()`

**Task 3.3: Zustand auth store** (`frontend-developer`)
- Create `src/store/useStore.js` with Zustand
- State: `user`, `session`, `isLoading`, `savedEvents`, `follows`
- Actions: `signIn`, `signOut`, `toggleLike`, `toggleNotify`, `toggleFollow`
- On init: check session, load saved events from Supabase if logged in, else from localStorage

**Task 3.4: AuthModal component** (`frontend-developer` + `ArchitectUX`)
- Modal with email/password login, signup toggle, Google OAuth button
- Wire to "Sign in" button in hero nav (currently dead)
- On success: close modal, update Zustand store, show toast
- Use `@supabase/auth-ui-react` or build custom (custom is simpler for this project)

**Task 3.5: Auto-create profile on signup** (`database-architect`)

```sql
-- Trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Task 3.6: Migrate likes to saved_events** (`backend-developer` + `frontend-developer`)
- Backend: add `GET /api/users/:id/saved` and `POST /api/users/:id/saved` endpoints
- Frontend: when user logs in, migrate any localStorage likes to `saved_events` table, then clear localStorage
- When logged out: fall back to localStorage (Phase 2 behavior)
- `toggleLike` and `toggleNotify` in Zustand call Supabase directly via the client library (no need to go through backend for this)

**Task 3.7: RLS policies** (`database-architect` + `security-engineer`)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Saved events: users can only see/modify their own
CREATE POLICY "Users can view own saved events" ON saved_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved events" ON saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved events" ON saved_events FOR DELETE USING (auth.uid() = user_id);

-- Follows: users can only see/modify their own
CREATE POLICY "Users can view own follows" ON follows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE USING (auth.uid() = user_id);
```

**Task 3.8: Profile page** (`frontend-developer` + `ui-designer`)
- Route or modal showing: display name, avatar, city, saved events list, followed artists/venues
- Edit display name, city, radius

**Task 3.9: Follow system** (`full-stack-developer`)
- "Follow" button on artist names and venue names in event cards
- Follows stored in `follows` table
- Profile page shows "Following" section

---

> ### **CHECKPOINT [Phase 3]**
>
> - [ ] Sign up with email at the Vercel URL — receive confirmation, profile auto-created in `profiles` table
> - [ ] Log in — "Sign in" button changes to user avatar/name
> - [ ] Like 3 events while logged in — refresh page — likes persist (check `saved_events` table in Supabase)
> - [ ] Log out — likes from localStorage still show for anonymous browsing
> - [ ] Log back in — previously saved events still liked
> - [ ] Follow an artist — shows in profile page — row exists in `follows` table
> - [ ] RLS test: run this in Supabase SQL editor and confirm it returns 0 rows (service role bypasses RLS, but anon should not):
>   ```sql
>   -- Verify RLS is active
>   SELECT count(*) FROM saved_events; -- should work with service key
>   ```
>
> **Hard gate:** Do not proceed to Phase 4 until all criteria pass.
>
> **On failure:**
> - Auth not working: check Supabase Auth > Users tab for the signup attempt. Check browser console for CORS errors. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel env.
> - Likes not persisting: `activate backend-developer` + check `saved_events` table schema matches code expectations
> - RLS blocking legitimate access: `activate security-engineer` + review policies with `SELECT * FROM pg_policies`

---

### PHASE 4: User Submissions

**Goal:** Promoters and fans can submit events through a form. Admins moderate via a queue.

**Prerequisites:** Phase 3 checkpoint passed. Auth working. User can be identified.

**Agent Roster:**

| Task | Agent |
|------|-------|
| Submission form UI | `frontend-developer` + `ArchitectUX` |
| Submission API endpoint | `backend-developer` |
| Image upload | `backend-developer` |
| Admin moderation page | `full-stack-developer` |
| Venue submission | `database-architect` + `backend-developer` |

**GSD Commands:**

```
/gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work → /gsd:ship
```

**Task Breakdown:**

**Task 4.1: Submit Event modal** (`frontend-developer` + `ArchitectUX`)
- Fields: title, category (dropdown), date, start time, end time, venue (searchable from existing + "Add new"), price range or "Free" toggle, ticket URL, description, image upload
- Only visible to logged-in users
- POST to `/api/events/submit` (already exists in `server/routes/events.js`)
- Show "Pending Review" confirmation toast

**Task 4.2: Enhance submission endpoint** (`backend-developer`)
- Add `submitted_by` field (from auth token)
- Add server-side validation: title length, date in future, valid URL format
- Rate limit: max 5 submissions per user per day

**Task 4.3: Image upload to Supabase Storage** (`backend-developer`)
- Create `event-images` bucket in Supabase Storage
- Frontend uploads directly to Supabase Storage using the client
- Store the public URL in `image_url`

**Task 4.4: Admin moderation page** (`full-stack-developer`)
- Route `/admin` protected by admin password (env var `ADMIN_PASSWORD`)
- Shows all events where `is_verified = false`
- Approve button: sets `is_verified = true` (endpoint already exists)
- Reject button: deletes the event (endpoint already exists)
- Show submission count, user who submitted

**Task 4.5: Venue submission** (`database-architect` + `backend-developer`)
- When user selects "Add new venue" in the event submission form
- Creates a pending venue (or just inserts directly into `venues` with a `is_verified` column)
- Admin can review/approve venues too

---

> ### **CHECKPOINT [Phase 4]**
>
> - [ ] Log in, click "Submit Event", fill out form, submit — event appears in Supabase `events` table with `is_verified = false` and correct `submitted_by`
> - [ ] Visit `/admin`, enter admin password — see the submitted event in the moderation queue
> - [ ] Approve the event — it now appears in the main calendar/feed
> - [ ] Submit an event with an uploaded image — image loads correctly from Supabase Storage URL
> - [ ] Submit 6 events rapidly — 6th should be rate-limited (429 response)
>
> **Hard gate:** Do not proceed to Phase 5 until all criteria pass.
>
> **On failure:** `activate full-stack-developer` + `/gsd:debug`

---

### PHASE 5: Map View

**Goal:** Interactive map showing event venue pins with filtering, clustering, and geolocation.

**Prerequisites:** Phase 4 checkpoint passed. Events have lat/lng via venues.

**Agent Roster:**

| Task | Agent |
|------|-------|
| Mapbox setup + token | `devops-engineer` |
| MapView component | `frontend-developer` |
| View toggle (Calendar/Map) | `frontend-developer` + `ArchitectUX` |
| Geolocation | `frontend-developer` |
| Venue clustering | `frontend-developer` |

**GSD Commands:**

```
/gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work → /gsd:ship
```

**Task Breakdown:**

**Task 5.1: Mapbox account + token** (`devops-engineer`)
- Sign up at mapbox.com, get public access token
- Add `VITE_MAPBOX_TOKEN` to Vercel env vars

**Task 5.2: Install dependencies**

```bash
npm install mapbox-gl react-map-gl
```

**Task 5.3: MapView component** (`frontend-developer`)
- Center on Toronto (43.6532, -79.3832), zoom 11
- Fetch events for current month (reuse existing query)
- Pin per venue, colored by category
- Click pin: popup with event title, date, time, "View Details" / "Buy Tickets"
- Cluster overlapping pins with count badge

**Task 5.4: View toggle** (`frontend-developer` + `ArchitectUX`)
- Header toggle: Calendar icon / Map icon
- Smooth transition between views
- Sidebar persists in both views (category breakdown, hot dates)

**Task 5.5: Geolocation** (`frontend-developer`)
- "Use my location" button
- `navigator.geolocation.getCurrentPosition()`
- Recenter map, update radius display
- Store coords in Zustand for distance calculations

---

> ### **CHECKPOINT [Phase 5]**
>
> - [ ] Map loads at the Vercel URL with Mapbox tiles rendering correctly
> - [ ] At least 5 venue pins visible on the map for the current month
> - [ ] Click a pin — popup shows event details with correct data
> - [ ] Toggle between Calendar and Map views — both work, data is consistent
> - [ ] "Use my location" moves map center (test on mobile or with browser geolocation override)
>
> **Hard gate:** Do not proceed to Phase 6 until all criteria pass.
>
> **On failure:**
> - Map blank: check `VITE_MAPBOX_TOKEN` in Vercel env vars, check browser console for Mapbox errors
> - No pins: check that venues have non-null lat/lng in Supabase

---

### PHASE 6: Discovery Engine

**Goal:** Trending algorithm, personalized recommendations, AI-generated event descriptions.

**Prerequisites:** Phase 5 checkpoint passed. Enough events and user activity to rank.

**Agent Roster:**

| Task | Agent |
|------|-------|
| event_views table + tracking | `database-architect` + `backend-developer` |
| Popularity scoring function | `database-architect` |
| Personalized recommendations endpoint | `backend-developer` |
| Discovery feed UI update | `frontend-developer` |
| AI descriptions via Claude API | `ai-engineer` |

**GSD Commands:**

```
/gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work → /gsd:ship
```

**Task Breakdown:**

**Task 6.1: Event views tracking** (`database-architect` + `backend-developer`)

```sql
CREATE TABLE event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_views_event ON event_views(event_id);
```

- Backend: `POST /api/events/:id/view` — log a view (fire-and-forget, no auth required)
- Frontend: fire view event when user clicks into event detail or expands card

**Task 6.2: Popularity scoring** (`database-architect`)

```sql
CREATE OR REPLACE FUNCTION update_popularity_scores()
RETURNS void AS $$
BEGIN
  UPDATE events SET popularity_score = sub.score
  FROM (
    SELECT
      e.id,
      COALESCE(saves.cnt * 3, 0) +
      COALESCE(views.cnt * 1, 0) +
      COALESCE(notifies.cnt * 2, 0) AS score
    FROM events e
    LEFT JOIN (SELECT event_id, COUNT(*) as cnt FROM saved_events GROUP BY event_id) saves ON saves.event_id = e.id
    LEFT JOIN (SELECT event_id, COUNT(*) as cnt FROM event_views GROUP BY event_id) views ON views.event_id = e.id
    LEFT JOIN (SELECT event_id, COUNT(*) as cnt FROM saved_events WHERE notify = true GROUP BY event_id) notifies ON notifies.event_id = e.id
  ) sub
  WHERE events.id = sub.id;
END;
$$ LANGUAGE plpgsql;
```

- Run via cron in backend (every hour) or Supabase pg_cron extension

**Task 6.3: Personalized recommendations** (`backend-developer`)
- `GET /api/events/recommended?user_id=UUID`
- Query user's saved events to find top 3 categories
- Return events in those categories, sorted by popularity_score DESC, excluding already-saved events
- Fallback for anonymous users: just return top events by popularity_score

**Task 6.4: Discovery feed update** (`frontend-developer`)
- "Trending" section uses popularity_score ordering
- "For You" section uses personalized endpoint (if logged in)
- "New This Week" section: events created in last 7 days

**Task 6.5: AI event descriptions** (`ai-engineer`)
- Add `ANTHROPIC_API_KEY` to Railway env vars
- Background job: when event has no description, call Claude API
- Prompt: event title, category, venue, artist → 2-sentence exciting description
- Write result to `events.description`
- Rate limit: max 50 descriptions per sync run

---

> ### **CHECKPOINT [Phase 6]**
>
> - [ ] `GET /api/events?limit=10` returns events ordered by `popularity_score` (highest first when sorted)
> - [ ] `GET /api/events/recommended?user_id=UUID` returns personalized results (different from global trending)
> - [ ] At least 5 events in Supabase have non-null AI-generated `description` values
> - [ ] Discovery feed shows "Trending" and "For You" sections with different content
> - [ ] `event_views` table has rows after clicking around the app
>
> **Hard gate:** Do not proceed to Phase 7 until all criteria pass.
>
> **On failure:**
> - AI descriptions empty: check `ANTHROPIC_API_KEY` in Railway, check Railway logs for Claude API errors
> - Recommendations identical to trending: verify `saved_events` has data for test user

---

### PHASE 7: Mobile / PWA

**Goal:** EventPulse is installable on phones, works offline for cached data, sends push notifications.

**Prerequisites:** Phase 6 checkpoint passed.

**Agent Roster:**

| Task | Agent |
|------|-------|
| PWA manifest + service worker | `mobile-developer` + `performance-engineer` |
| Offline caching strategy | `performance-engineer` |
| Push notifications | `mobile-developer` + `backend-developer` |
| Responsive polish | `frontend-developer` + `ui-designer` |
| Lighthouse audit | `performance-engineer` |

**GSD Commands:**

```
/gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work → /gsd:ship
```

**Task Breakdown:**

**Task 7.1: PWA setup** (`mobile-developer`)

```bash
npm install vite-plugin-pwa
```

- Add to `vite.config.js`: VitePWA plugin config
- `manifest.json`: name "EventPulse", theme `#7c3aed`, background `#faf8f5`, icons (192px + 512px)
- Service worker: cache app shell + API responses (stale-while-revalidate for events)

**Task 7.2: Push notifications** (`mobile-developer` + `backend-developer`)
- Generate VAPID keys: `npx web-push generate-vapid-keys`
- Add `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` to Railway, `VITE_VAPID_PUBLIC_KEY` to Vercel
- Frontend: request notification permission, subscribe browser, save subscription to Supabase
- Backend: cron job 24h before event → send push to all users who have `notify = true` for that event

```bash
npm install web-push  # server/package.json
```

**Task 7.3: Responsive polish** (`frontend-developer` + `ui-designer`)
- Audit all components at 375px, 768px, 1024px widths
- Fix any overflow, truncation, or tap target issues
- Bottom nav for mobile (Calendar / Discover / Map / Profile)

**Task 7.4: Lighthouse audit** (`performance-engineer`)
- Target: 80+ on all four scores (Performance, Accessibility, Best Practices, SEO)
- Fix any critical issues flagged
- Optimize images (lazy loading, proper sizing)

---

> ### **CHECKPOINT [Phase 7]**
>
> - [ ] On mobile Chrome: "Add to Home Screen" prompt appears (or can be triggered from browser menu)
> - [ ] Installed PWA opens with splash screen and no browser chrome
> - [ ] Turn off WiFi, open app — cached events still display (offline mode)
> - [ ] Enable notifications for an event — receive a push notification (test with `web-push` CLI or wait for cron)
> - [ ] Lighthouse scores: Performance > 80, Accessibility > 80, Best Practices > 80, SEO > 80
>
> **Hard gate:** Do not proceed to Phase 8 until all criteria pass.
>
> **On failure:**
> - No install prompt: check manifest.json is served correctly, check HTTPS, check service worker registration
> - Push not arriving: check VAPID keys match between frontend and backend, check subscription endpoint in Supabase

---

### PHASE 8: Monetization

**Goal:** Revenue through Ticketmaster affiliate links, promoted listings, and Stripe-powered venue pro accounts.

**Prerequisites:** Phase 7 checkpoint passed. App is production-quality, mobile-ready.

**Agent Roster:**

| Task | Agent |
|------|-------|
| Affiliate link integration | `backend-developer` |
| Promoted listings system | `full-stack-developer` |
| Stripe integration | `backend-developer` + `security-engineer` |
| Venue pro dashboard | `frontend-developer` + `ArchitectUX` |
| Analytics / metrics | `backend-developer` |

**GSD Commands:**

```
/gsd:discuss-phase → /gsd:plan-phase → /gsd:execute-phase → /gsd:verify-work → /gsd:ship
```

**Task Breakdown:**

**Task 8.1: Ticketmaster affiliate links** (`backend-developer`)
- Apply at Ticketmaster Affiliate Program
- Append affiliate ID to all Ticketmaster `ticket_url` values during sync
- Track clicks: `POST /api/events/:id/click` logs to an `event_clicks` table

**Task 8.2: Promoted listings** (`full-stack-developer`)

```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_promoted BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS promotion_expires_at TIMESTAMPTZ;
```

- Promoted events: appear first in Discover feed, subtle "Sponsored" label, highlighted border
- Admin endpoint: `POST /api/admin/promote/:id` with expiry date
- Cron job: clear expired promotions nightly

**Task 8.3: Stripe integration** (`backend-developer` + `security-engineer`)
- Add `STRIPE_SECRET_KEY` to Railway, `VITE_STRIPE_PUBLIC_KEY` to Vercel
- Stripe Checkout for venue pro subscriptions ($29/month)
- Webhook endpoint: `POST /api/webhooks/stripe` to handle subscription events

```bash
npm install stripe  # server/package.json
```

**Task 8.4: Venue pro features** (`frontend-developer` + `ArchitectUX`)
- Verified badge on venue listings
- Unlimited event submissions (bypass rate limit)
- Analytics dashboard: views, saves, clicks per event
- Featured placement in search results

**Task 8.5: Analytics tracking** (`backend-developer`)

```sql
CREATE TABLE event_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Track: event views, ticket link clicks, search queries
- Admin dashboard shows aggregate metrics

---

> ### **CHECKPOINT [Phase 8]**
>
> - [ ] Ticketmaster ticket links include affiliate parameter
> - [ ] Promoted event appears at top of Discover feed with "Sponsored" label
> - [ ] Stripe Checkout flow works end-to-end in test mode (use Stripe test card `4242 4242 4242 4242`)
> - [ ] Venue pro account gets verified badge after successful payment
> - [ ] `event_clicks` table has rows after clicking "Buy" buttons
>
> **Ship it.** EventPulse is a product.

---

## 5. Cross-Cutting Concerns

### Error Handling Standards

Every backend endpoint must:

```javascript
router.get('/example', async (req, res) => {
  try {
    // ... logic
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('GET /api/example error:', err);
    res.status(err.status || 500).json({
      error: err.userMessage || 'Internal server error',
    });
  }
});
```

Frontend fetch calls must:
- Show loading state (skeleton or spinner)
- Show error state with retry button on failure
- Use TanStack Query's built-in retry (3 attempts with exponential backoff)

### Deploy Failure Recovery

**Railway fails to deploy:**
1. Check Railway logs: dashboard > Deployments > click failed deploy
2. Most common: missing dependency in `server/package.json`
3. Fix: add dependency, push to main, Railway auto-redeploys
4. If stuck: verify build/start commands in Railway settings

**Vercel fails to deploy:**
1. Check Vercel > Deployments > click failed deploy > build logs
2. Most common: TypeScript/lint error, missing env var
3. Fix locally first: `npm run build` in project root

### Supabase Migration Strategy

- No ORM. Raw SQL only.
- Keep all migrations in `/server/migrations/` as numbered files:
  ```
  server/migrations/
    001_initial_schema.sql
    002_add_city_to_events.sql
    003_add_sync_runs.sql
    004_auth_trigger.sql
    005_rls_policies.sql
    ...
  ```
- Run manually via Supabase SQL Editor
- Each file is idempotent (uses `IF NOT EXISTS`, `CREATE OR REPLACE`)
- After running, record in CLAUDE.md which migrations have been applied

### Secret Management by Phase

| Phase | Railway (add) | Vercel (add) |
|-------|---------------|--------------|
| 2 | (already set) | (already set) |
| 3 | — | (already set: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) |
| 4 | — | — |
| 5 | — | `VITE_MAPBOX_TOKEN` |
| 6 | `ANTHROPIC_API_KEY` | — |
| 7 | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | `VITE_VAPID_PUBLIC_KEY` |
| 8 | `STRIPE_SECRET_KEY` | `VITE_STRIPE_PUBLIC_KEY` |

---

## 6. Quick-Start Cheatsheet

Copy-paste the relevant block into Claude Code at the start of any session.

### Starting Phase 2

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

I'm working on EventPulse Phase 2: Real APIs.

Current state: Railway may be broken, city filter has a join bug, price display shows $undefined.

/gsd:discuss-phase

Context: Phase 2 tasks are documented in "march 22 integration plan.md". The key fixes are:
1. Railway deploy config (blank root dir, cd server for build/start)
2. Add city column to events table
3. Fix sync service to populate city
4. Fix events route city filter (use direct column, not join)
5. Fix price display bug in EventPulse.jsx
6. Replace hardcoded hero stats
7. Add localStorage for likes
8. Trigger sync and verify data flows end-to-end
```

### Starting Phase 3

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

I'm working on EventPulse Phase 3: User Accounts.

Phase 2 checkpoint: PASSED. Real events loading, frontend showing data.

/gsd:discuss-phase

Context: Phase 3 tasks are documented in "march 22 integration plan.md". Key work:
1. Supabase Auth (email + Google OAuth)
2. AuthModal component (wire to dead "Sign in" button)
3. Zustand store for auth + saved events
4. Migrate localStorage likes to saved_events table
5. RLS policies on profiles, saved_events, follows
6. Profile page
7. Follow system for artists/venues
```

### Starting Phase 4

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

I'm working on EventPulse Phase 4: User Submissions.

Phase 3 checkpoint: PASSED. Auth working, likes persist to Supabase.

/gsd:discuss-phase

Context: Phase 4 adds event submission form, image upload to Supabase Storage, and admin moderation page. Submit endpoint already exists at POST /api/events/submit. Admin routes already exist.
```

### Starting Phase 5

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

I'm working on EventPulse Phase 5: Map View.

Phase 4 checkpoint: PASSED.

/gsd:discuss-phase

Context: Phase 5 adds Mapbox GL JS map with venue pins, category coloring, clustering, view toggle, and geolocation. Need VITE_MAPBOX_TOKEN in Vercel first.
```

### Starting Phase 6

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

I'm working on EventPulse Phase 6: Discovery Engine.

Phase 5 checkpoint: PASSED.

/gsd:discuss-phase

Context: Phase 6 adds event_views tracking, popularity scoring function, personalized recommendations endpoint, and AI descriptions via Claude API. Need ANTHROPIC_API_KEY in Railway.
```

### Starting Phase 7

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

I'm working on EventPulse Phase 7: Mobile/PWA.

Phase 6 checkpoint: PASSED.

/gsd:discuss-phase

Context: Phase 7 converts to PWA with vite-plugin-pwa, adds push notifications with web-push + VAPID keys, responsive polish, and Lighthouse audit targeting 80+ scores.
```

### Starting Phase 8

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

I'm working on EventPulse Phase 8: Monetization.

Phase 7 checkpoint: PASSED. PWA installed, push working, Lighthouse 80+.

/gsd:discuss-phase

Context: Phase 8 adds Ticketmaster affiliate links, promoted listings, Stripe venue pro subscriptions, and analytics tracking. Need STRIPE_SECRET_KEY in Railway and VITE_STRIPE_PUBLIC_KEY in Vercel.
```

### Resuming Mid-Phase

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md
Read /Users/macintosh/Documents/GitHub/eventpulse/.planning/PLAN.md

I'm resuming EventPulse Phase [X]. Pick up where the plan left off.

/gsd:execute-phase
```

### Debugging a Failure

```
Read /Users/macintosh/Documents/GitHub/eventpulse/CLAUDE.md

Activate [relevant-agent] mode.

/gsd:debug

Problem: [describe what's broken]
Expected: [what should happen]
Actual: [what actually happens]
```
