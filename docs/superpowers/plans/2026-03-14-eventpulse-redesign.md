# EventPulse UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign EventPulse from a dark-themed single-view app into a light-themed editorial landing page + two-column calendar/list app.

**Architecture:** All changes happen inside `src/EventPulse.jsx` (946-line single-file component with inline React styles). The page gains a hero section at the top, a stats strip, then a fixed-calendar-left / scrollable-list-right main layout. Dark backgrounds are replaced with a warm beige palette throughout. No new dependencies. No new component files.

**Tech Stack:** React 18, Vite, inline React styles (object syntax), `@tanstack/react-query` for data fetching

**Spec:** `docs/superpowers/specs/2026-03-14-eventpulse-redesign.md`

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `public/venues-poster.png` | **Create** (copy) | Venue poster image asset for hero |
| `src/EventPulse.jsx` | **Modify** | Everything below — theme, layout, hero, stats strip, two-column layout |

No other files change. Server code is untouched.

---

## Chunk 1: Asset + Theme Foundation

### Task 1: Copy image asset

**Files:**
- Create: `public/venues-poster.png`

- [ ] **Step 1: Copy the image**

```bash
cp ~/Downloads/Gemini_Generated_Image_f3pwbbf3pwbbf3pw.png \
   /Users/macintosh/Documents/GitHub/eventpulse/public/venues-poster.png
```

- [ ] **Step 2: Verify it's there**

```bash
ls -lh /Users/macintosh/Documents/GitHub/eventpulse/public/venues-poster.png
```
Expected: file listed, size ~500KB–2MB

- [ ] **Step 3: Commit**

```bash
cd /Users/macintosh/Documents/GitHub/eventpulse
git add public/venues-poster.png
git commit -m "feat: add GTA venues poster image asset"
```

---

### Task 2: Define the light theme palette constants

**Files:**
- Modify: `src/EventPulse.jsx` — add palette constants near the top of the file, just after the existing category/source constants

- [ ] **Step 1: Open `src/EventPulse.jsx` and locate the constants block**

Find the section that defines `CATEGORIES`, `SOURCES`, and similar top-level constants (around line 1–80 of the file). This is where the palette goes.

- [ ] **Step 2: Add the palette object immediately after imports, before any component code**

```jsx
// ── Light theme palette ──────────────────────────────────
const THEME = {
  pageBg:      '#f0ebe3',
  cardBg:      '#ffffff',
  stripBg:     '#e8e0d4',
  border:      '#e5ddd4',
  borderDark:  '#d4ccc4',
  text:        '#1a1a1a',
  textMuted:   '#6b6055',
  textFaint:   '#9c8e82',
  shadow:      '0 2px 16px rgba(0,0,0,0.08)',
  shadowSm:    '0 1px 6px rgba(0,0,0,0.07)',
  shadowHero:  '0 12px 48px rgba(0,0,0,0.18)',
};
```

- [ ] **Step 3: Verify the app still builds**

```bash
cd /Users/macintosh/Documents/GitHub/eventpulse
npm run dev
```
Expected: dev server starts, no errors in terminal. Open `http://localhost:5173` — app renders (still dark for now, that's fine).

- [ ] **Step 4: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: add light theme palette constants"
```

---

### Task 3: Convert the root container and body background to light theme

**Files:**
- Modify: `src/EventPulse.jsx` — the outermost `<div>` wrapper style in the main component return

- [ ] **Step 1: Find the root container style**

Search for the outermost wrapper div in the component's return statement. It will have a style that sets `background`, `minHeight`, `fontFamily`, etc. It likely looks something like:

```jsx
<div style={{
  background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d1a2e 100%)',
  minHeight: '100vh',
  fontFamily: ...,
  color: '#fff',
  ...
}}>
```

- [ ] **Step 2: Replace the root container style**

```jsx
<div style={{
  background: THEME.pageBg,
  minHeight: '100vh',
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  color: THEME.text,
  overflowX: 'hidden',
}}>
```

- [ ] **Step 3: Find and update the `<style>` global tag (if present)**

If there is a `<style>` tag or `document.body.style` call setting a dark background, remove or update it to:
```js
document.body.style.background = '#f0ebe3';
document.body.style.margin = '0';
```

- [ ] **Step 4: Visual check**

Open `http://localhost:5173`. The page background should now be warm beige. Cards and modals will still be dark — that gets fixed in the next tasks.

- [ ] **Step 5: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: convert root background to light theme"
```

---

### Task 4: Convert all card, panel, and overlay styles to light theme

This task works through every styled element in the file and replaces dark colours. Work methodically top-to-bottom through the JSX.

**Files:**
- Modify: `src/EventPulse.jsx` — all inline style objects

- [ ] **Step 1: Replace dark card backgrounds**

Find every style object using dark card colours (common values: `#1a1a2e`, `#16213e`, `rgba(255,255,255,0.05)`, `rgba(0,0,0,0.3)`, `#0d0d1a`) and replace:

| Old value | New value |
|-----------|-----------|
| `#1a1a2e` | `THEME.cardBg` |
| `#16213e` | `THEME.cardBg` |
| `rgba(255,255,255,0.05)` | `THEME.cardBg` |
| `rgba(255,255,255,0.08)` | `THEME.cardBg` |
| `#0d0d1a` | `THEME.pageBg` |
| `rgba(0,0,0,0.4)` (card backgrounds) | `THEME.cardBg` |

- [ ] **Step 2: Replace dark text colours with light-theme text**

| Old value | New value |
|-----------|-----------|
| `#ffffff` (body text) | `THEME.text` |
| `rgba(255,255,255,0.9)` (primary text) | `THEME.text` |
| `rgba(255,255,255,0.7)` (secondary text) | `THEME.textMuted` |
| `rgba(255,255,255,0.5)` (faint text) | `THEME.textFaint` |
| `rgba(255,255,255,0.3)` (very faint) | `THEME.textFaint` |

- [ ] **Step 3: Replace dark borders and dividers**

| Old value | New value |
|-----------|-----------|
| `rgba(255,255,255,0.1)` (borders) | `THEME.border` |
| `rgba(255,255,255,0.05)` (subtle dividers) | `THEME.border` |

- [ ] **Step 4: Update box shadows**

Replace `box-shadow` values that use dark/glow effects:
- `0 4px 20px rgba(0,0,0,0.5)` → `THEME.shadow`
- `0 2px 10px rgba(0,0,0,0.3)` → `THEME.shadowSm`
- Remove any coloured glow shadows (e.g. `0 0 20px rgba(123,58,237,0.3)`) — replace with `THEME.shadowSm`

- [ ] **Step 5: Update input/search field styles**

Find the search input style. Replace dark background with:
```jsx
style={{
  background: THEME.cardBg,
  border: `1px solid ${THEME.border}`,
  color: THEME.text,
  borderRadius: '8px',
  padding: '0.6rem 1rem',
  width: '100%',
  fontSize: '0.9rem',
  outline: 'none',
}}
```

- [ ] **Step 6: Update category filter pill styles (unselected state)**

```jsx
// unselected pill:
background: THEME.cardBg,
border: `1px solid ${THEME.border}`,
color: THEME.textMuted,

// selected pill (keep category colour as background):
background: category.color,
color: '#ffffff',
border: 'none',
```

- [ ] **Step 7: Visual check**

`http://localhost:5173` — the whole app should now be light. Cards white, backgrounds beige, text dark. Category density colours on the calendar grid should still pop (they're saturated colours on white, which works well).

- [ ] **Step 8: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: convert all card and panel styles to light theme"
```

---

## Chunk 2: Hero Section

### Task 5: Add the hero section structure

**Files:**
- Modify: `src/EventPulse.jsx` — insert hero JSX as the very first child of the root container div, before everything else

- [ ] **Step 1: Locate the insertion point**

Find the opening `<div>` of the root container (the one you updated the style of in Task 3). The hero goes as its first child, before the existing header/calendar/stats.

- [ ] **Step 2: Add the hero nav**

Insert this as the first element inside the root container:

```jsx
{/* ── HERO ─────────────────────────────── */}
<div id="hero" style={{
  minHeight: '100vh',
  background: THEME.pageBg,
  display: 'flex',
  flexDirection: 'column',
  padding: '0',
  position: 'relative',
}}>

  {/* Nav */}
  <nav style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2.5rem',
  }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
      <span style={{ fontWeight: 900, fontSize: '1.2rem', color: THEME.text, letterSpacing: '-0.02em' }}>
        EventPulse
      </span>
      <span style={{ fontSize: '0.7rem', color: THEME.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        · GTA
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <a
        href="#app"
        style={{ fontSize: '0.85rem', color: THEME.textMuted, textDecoration: 'none', fontWeight: 500 }}
      >
        How it works
      </a>
      <button style={{
        background: 'transparent',
        border: `1px solid ${THEME.border}`,
        color: THEME.text,
        padding: '0.4rem 1rem',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
      }}>
        Sign in
      </button>
    </div>
  </nav>

  {/* Hero body — two columns */}
  {/* ... added in Task 6 */}

</div>
{/* ── END HERO ─────────────────────────── */}
```

- [ ] **Step 3: Visual check**

`http://localhost:5173` — a beige nav bar should appear at the very top of the page above the existing app content.

- [ ] **Step 4: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: add hero section wrapper and nav"
```

---

### Task 6: Add hero two-column body (headline + strips + poster)

**Files:**
- Modify: `src/EventPulse.jsx` — replace the `{/* ... added in Task 6 */}` placeholder inside the hero div

- [ ] **Step 1: Add the two-column hero body**

Replace the placeholder comment with:

```jsx
{/* Hero body */}
<div style={{
  display: 'flex',
  flex: 1,
  alignItems: 'stretch',
  padding: '2rem 2.5rem 0',
  gap: '3rem',
  maxWidth: '1400px',
  width: '100%',
  margin: '0 auto',
}}>

  {/* Left: editorial content */}
  <div style={{
    flex: '0 0 55%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: '3rem',
  }}>

    {/* Eyebrow */}
    <p style={{
      fontSize: '0.72rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: THEME.textMuted,
      marginBottom: '1.25rem',
    }}>
      EventPulse · GTA
    </p>

    {/* Headline */}
    <h1 style={{
      fontSize: 'clamp(4rem, 8vw, 8.5rem)',
      fontWeight: 900,
      lineHeight: 0.93,
      letterSpacing: '-0.03em',
      color: THEME.text,
      margin: '0 0 1.5rem 0',
    }}>
      Events,<br />organized.
    </h1>

    {/* Subheadline */}
    <p style={{
      fontSize: '1.1rem',
      fontWeight: 400,
      color: THEME.textMuted,
      lineHeight: 1.5,
      maxWidth: '480px',
      marginBottom: '2.5rem',
    }}>
      Every GTA concert, festival, and show.<br />One calendar.
    </p>

    {/* Category strips */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '2.5rem' }}>
      {[
        { label: 'Concerts', desc: '847 shows this month', color: '#7c3aed' },
        { label: 'Festivals & Outdoor', desc: 'Across 28 GTA venues', color: '#ea580c' },
        { label: 'Theatre · Comedy · Sports', desc: 'Updated daily from live sources', color: '#0369a1' },
      ].map(strip => (
        <div key={strip.label} style={{
          background: strip.color,
          height: '66px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          borderRadius: '4px',
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{strip.label}</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>{strip.desc}</span>
        </div>
      ))}
    </div>

    {/* Scroll CTA */}
    <a
      href="#app"
      onClick={e => {
        e.preventDefault();
        document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' });
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: THEME.textMuted,
        textDecoration: 'none',
        fontWeight: 500,
        animation: 'bounceDown 1.5s ease-in-out infinite',
        alignSelf: 'flex-start',
      }}
    >
      ↓ Browse events
    </a>
  </div>

  {/* Right: venue poster */}
  <div style={{
    flex: '0 0 42%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '0',
  }}>
    <img
      src="/venues-poster.png"
      alt="GTA venues — Massey Hall, Scotiabank Arena, Budweiser Stage and more"
      style={{
        width: '100%',
        maxWidth: '420px',
        maxHeight: '85vh',
        objectFit: 'cover',
        objectPosition: 'top',
        borderRadius: '8px',
        border: `3px solid ${THEME.border}`,
        boxShadow: THEME.shadowHero,
        display: 'block',
      }}
    />
  </div>

</div>
```

- [ ] **Step 2: Add the bounce keyframe animation**

Find any existing `<style>` tag in the JSX (there may be one for scrollbar hiding or custom animations). Add to it:

```jsx
<style>{`
  @keyframes bounceDown {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(5px); }
  }
`}</style>
```

If no `<style>` tag exists in the JSX, add one as a sibling to the hero div inside the root container.

- [ ] **Step 3: Visual check**

`http://localhost:5173` — the hero should show:
- Beige background
- Nav with EventPulse · GTA wordmark
- Giant "Events, organized." headline
- Three coloured strips
- Venue poster image on the right
- Bouncing scroll CTA at bottom

- [ ] **Step 4: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: add hero two-column layout with headline, strips, and venue poster"
```

---

## Chunk 3: Stats Strip

### Task 7: Rebuild the stats section as a full-width strip

The existing stats dashboard is somewhere in the current app layout (likely above the calendar). This task replaces it with a compact full-width strip placed between the hero and the main app.

**Files:**
- Modify: `src/EventPulse.jsx`

- [ ] **Step 1: Find and remove the existing stats dashboard**

Search for the existing stats rendering code — it likely renders total event count, busiest days, top categories, venue count. It may be a `<div>` with a grid of stat cards. **Delete it entirely** (or comment it out temporarily until the new strip is confirmed working).

- [ ] **Step 2: Add the stats strip immediately after the closing `</div>` of the hero section**

```jsx
{/* ── STATS STRIP ─────────────────────── */}
<div style={{
  background: THEME.stripBg,
  borderTop: `1px solid ${THEME.borderDark}`,
  borderBottom: `1px solid ${THEME.borderDark}`,
  padding: '1.25rem 2.5rem',
}}>
  <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

    {/* Counter row */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginBottom: '0.85rem',
    }}>
      {[
        { num: events?.length ?? '—', label: 'Events this month' },
        { num: '28', label: 'Venues' },
        { num: '6', label: 'Categories' },
        { num: '4', label: 'Live sources' },
      ].map((stat, i) => (
        <React.Fragment key={stat.label}>
          {i > 0 && (
            <span style={{ color: THEME.borderDark, fontSize: '1.2rem', lineHeight: 1 }}>·</span>
          )}
          <span style={{ fontSize: '0.875rem', color: THEME.text }}>
            <strong style={{ fontWeight: 700 }}>{stat.num}</strong>{' '}
            <span style={{ color: THEME.textMuted }}>{stat.label}</span>
          </span>
        </React.Fragment>
      ))}
    </div>

    {/* Divider */}
    <div style={{ height: '1px', background: THEME.borderDark, marginBottom: '0.85rem' }} />

    {/* Hot dates row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: THEME.textMuted, marginRight: '0.25rem' }}>
        Hot dates
      </span>
      {hotDates.slice(0, 6).map(({ day, count }) => (
        <button
          key={day}
          onClick={() => setSelectedDay(day)}
          style={{
            background: selectedDay === day ? THEME.text : THEME.cardBg,
            color: selectedDay === day ? '#fff' : THEME.text,
            border: `1px solid ${THEME.border}`,
            borderRadius: '99px',
            padding: '0.25rem 0.7rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          {day}
          <span style={{
            background: selectedDay === day ? 'rgba(255,255,255,0.25)' : THEME.stripBg,
            borderRadius: '99px',
            padding: '0 0.35rem',
            fontSize: '0.65rem',
          }}>{count}</span>
        </button>
      ))}
    </div>

    {/* Category breakdown row */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: THEME.textMuted, marginRight: '0.25rem' }}>
        By type
      </span>
      {CATEGORIES.map(cat => {
        const count = events?.filter(e => e.category === cat.id).length ?? 0;
        if (count === 0) return null;
        return (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            style={{
              background: selectedCategory === cat.id ? cat.color : THEME.cardBg,
              color: selectedCategory === cat.id ? '#fff' : THEME.text,
              border: `1px solid ${selectedCategory === cat.id ? cat.color : THEME.border}`,
              borderLeft: `3px solid ${cat.color}`,
              borderRadius: '6px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.73rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {cat.emoji} {cat.label} ({count})
          </button>
        );
      })}
    </div>

  </div>
</div>
{/* ── END STATS STRIP ─────────────────── */}
```

**Note on `hotDates`:** This data is already computed inside the component from `events`. Find the existing `hotDates` derivation (likely a `useMemo` or computed variable) and ensure it's in scope here. If it's computed inside a sub-component, move it up to the main component scope.

**Note on `selectedDay` and `selectedCategory`:** These are existing state variables — use them as-is.

- [ ] **Step 3: Add the `id="app"` anchor**

Add `id="app"` to the div that wraps the main two-column layout (added in the next chunk). This makes the `href="#app"` scroll CTA work.

- [ ] **Step 4: Visual check**

`http://localhost:5173` — below the hero, a strip should show: event count, venues, categories, sources. Below that: hot date chips and category pills.

- [ ] **Step 5: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: add stats strip with counters, hot dates, and category breakdown"
```

---

## Chunk 4: Two-Column App Layout

### Task 8: Restructure the main layout to calendar-left / list-right

This is the largest structural change. The current layout stacks the calendar and discovery feed vertically. This task replaces it with a fixed-left calendar and a scrollable right event list.

**Files:**
- Modify: `src/EventPulse.jsx`

- [ ] **Step 1: Locate the current main layout wrapper**

Find the `<div>` that wraps the calendar grid and the discovery/event section. This is likely the main flex or grid container below the stats dashboard.

- [ ] **Step 2: Replace the main layout wrapper**

Wrap everything inside a new two-column container:

```jsx
{/* ── MAIN APP ─────────────────────────── */}
<div id="app" style={{
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1.5rem',
  padding: '1.5rem 2.5rem 3rem',
  maxWidth: '1400px',
  margin: '0 auto',
  width: '100%',
}}>

  {/* LEFT: Calendar panel (fixed width, sticky) */}
  <div style={{
    width: '380px',
    flexShrink: 0,
    position: 'sticky',
    top: '1.5rem',
    background: THEME.cardBg,
    borderRadius: '12px',
    boxShadow: THEME.shadow,
    border: `1px solid ${THEME.border}`,
    overflow: 'hidden',
  }}>
    {/* Calendar content goes here — see Task 9 */}
  </div>

  {/* RIGHT: Event list (flex, independently scrollable) */}
  <div style={{
    flex: 1,
    minWidth: 0,
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
    paddingRight: '4px', // prevents scrollbar overlap
  }}>
    {/* Event list content goes here — see Task 10 */}
  </div>

</div>
{/* ── END MAIN APP ─────────────────────── */}
```

- [ ] **Step 3: Move the calendar into the left panel**

Cut the existing calendar JSX (month nav arrows, day-of-week headers, calendar grid cells) and paste it inside the left panel div. Preserve all existing logic — only the wrapper container changes.

The calendar panel internal layout (top to bottom):
```jsx
{/* Month navigation */}
<div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <button onClick={prevMonth}>←</button>
  <span style={{ fontWeight: 700, color: THEME.text }}>{monthName} {year}</span>
  <button onClick={nextMonth}>→</button>
</div>

{/* Day of week headers */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0.5rem 0.75rem 0' }}>
  {['S','M','T','W','T','F','S'].map(...)}
</div>

{/* Calendar grid */}
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 0.75rem 0.75rem', gap: '3px' }}>
  {calendarDays.map(...)}
</div>
```

- [ ] **Step 4: Visual check (calendar only)**

`http://localhost:5173` — calendar should appear on the left, white card, sticky as you scroll. Density colours should be visible.

- [ ] **Step 5: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: add two-column layout with sticky calendar left panel"
```

---

### Task 9: Build the vertical event list in the right column

**Files:**
- Modify: `src/EventPulse.jsx`

- [ ] **Step 1: Add a sticky search + filter bar at the top of the right column**

Inside the right column div:

```jsx
{/* Sticky search + filter bar */}
<div style={{
  position: 'sticky',
  top: 0,
  background: THEME.pageBg,
  paddingBottom: '0.75rem',
  zIndex: 10,
}}>
  {/* Search input */}
  <input
    type="text"
    placeholder="Search events, artists, venues…"
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    style={{
      width: '100%',
      background: THEME.cardBg,
      border: `1px solid ${THEME.border}`,
      color: THEME.text,
      borderRadius: '8px',
      padding: '0.65rem 1rem',
      fontSize: '0.9rem',
      outline: 'none',
      marginBottom: '0.6rem',
    }}
  />

  {/* Active day filter indicator */}
  {selectedDay && (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: THEME.stripBg,
      border: `1px solid ${THEME.border}`,
      borderRadius: '6px',
      padding: '0.4rem 0.75rem',
      marginBottom: '0.6rem',
      fontSize: '0.8rem',
      color: THEME.textMuted,
    }}>
      <span>Showing <strong style={{ color: THEME.text }}>
        {new Date(year, currentMonth - 1, selectedDay)
          .toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}
      </strong></span>
      <button
        onClick={() => setSelectedDay(null)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, fontSize: '1rem' }}
      >
        ✕
      </button>
    </div>
  )}
</div>
```

**Note on state variables:** `searchQuery`, `setSearchQuery`, `selectedDay`, `setSelectedDay` are existing state variables. Use them exactly as-is.

- [ ] **Step 2: Add the filtered event list below the search bar**

```jsx
{/* Event list */}
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
  {filteredEvents.length === 0 ? (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: THEME.textMuted }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
      <div style={{ fontWeight: 600, color: THEME.text, marginBottom: '0.25rem' }}>No events found</div>
      <div style={{ fontSize: '0.85rem' }}>Try a different date or category</div>
    </div>
  ) : (
    filteredEvents.map(event => (
      <EventCard key={event.id} event={event} />
    ))
  )}
</div>
```

**Note on `filteredEvents`:** This is the already-computed filtered array (filtered by `searchQuery`, `selectedCategory`, and `selectedDay` if set). Find where it's currently computed in the file and confirm it filters by `selectedDay` as well. If it doesn't filter by `selectedDay`, add that filter:

```js
.filter(e => !selectedDay || e.day === selectedDay)
```

- [ ] **Step 3: Visual check**

`http://localhost:5173` — right column should show search bar, and event cards stacked vertically. Clicking a date on the calendar should filter the list.

- [ ] **Step 4: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: add vertical event list with search and date filter"
```

---

### Task 10: Restyle EventCard for the light theme

The existing `EventCard` component uses dark styles. This task updates it.

**Files:**
- Modify: `src/EventPulse.jsx` — the `EventCard` component

- [ ] **Step 1: Find the EventCard component**

Search for `function EventCard` or `const EventCard` in the file.

- [ ] **Step 2: Update EventCard styles**

The card wrapper:
```jsx
<div style={{
  background: THEME.cardBg,
  borderRadius: '10px',
  boxShadow: THEME.shadowSm,
  border: `1px solid ${THEME.border}`,
  borderLeft: `4px solid ${categoryColor}`,  // keep category accent
  padding: '0.85rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
}}>
```

Event title:
```jsx
style={{ fontWeight: 700, fontSize: '0.9rem', color: THEME.text, lineHeight: 1.3 }}
```

Venue + time line:
```jsx
style={{ fontSize: '0.78rem', color: THEME.textMuted }}
```

Action buttons (like/notify/buy):
```jsx
// Like button
style={{
  background: isLiked ? '#fff0f0' : THEME.cardBg,
  border: `1px solid ${isLiked ? '#fca5a5' : THEME.border}`,
  color: isLiked ? '#ef4444' : THEME.textMuted,
  ...
}}
```

- [ ] **Step 3: Visual check**

Event cards should look clean — white cards with a left colour accent, dark text, muted metadata.

- [ ] **Step 4: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: restyle EventCard for light theme"
```

---

### Task 11: Remove DateBubble modal and discovery carousel

**Files:**
- Modify: `src/EventPulse.jsx`

- [ ] **Step 1: Remove the DateBubble component render**

Find where `<DateBubble>` or the date bubble JSX is rendered (likely conditional on `selectedDay` and a bubble anchor position). Remove the entire conditional render block. The filtering of the right list replaces this.

- [ ] **Step 2: Remove the DateBubble component definition**

Find `function DateBubble` or `const DateBubble` and delete the entire component definition.

- [ ] **Step 3: Remove bubbleAnchor state**

Find `const [bubbleAnchor, setBubbleAnchor] = useState(null)` (or similar) and delete it.

- [ ] **Step 4: Clean up calendar day click handler**

The calendar day cells currently call `setBubbleAnchor` on click. Replace that call with just `setSelectedDay(day)`:

```jsx
// Before:
onClick={() => { setSelectedDay(day); setBubbleAnchor({ x: ..., y: ... }); }}

// After:
onClick={() => setSelectedDay(day === selectedDay ? null : day)}
```

The toggle (clicking same day deselects) is a nice UX touch.

- [ ] **Step 5: Remove the discovery carousel**

Find the horizontal discovery carousel section (likely a `<div>` with `overflowX: 'auto'` containing `DiscoverCard` components). Delete the entire section.

- [ ] **Step 6: Remove the DiscoverCard component definition**

Find `function DiscoverCard` or `const DiscoverCard` and delete it.

- [ ] **Step 7: Visual check**

`http://localhost:5173` — click a calendar date, the right list filters. No bubble appears. No horizontal carousel visible. Page scrolls cleanly.

- [ ] **Step 8: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: remove DateBubble modal and discovery carousel"
```

---

## Chunk 5: Polish + Deploy

### Task 12: Responsive adjustments and final polish

**Files:**
- Modify: `src/EventPulse.jsx`

- [ ] **Step 1: Add narrow-viewport fallback for the main two-column layout**

For viewports below ~900px the two-column layout should stack. Add a resize listener or use a CSS media approach. Since we're in inline styles, use a `useWindowWidth` hook:

```jsx
// Add near the top of the component:
const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
React.useEffect(() => {
  const handler = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

const isMobile = windowWidth < 900;
```

Then in the main layout:
```jsx
// Two-column container:
flexDirection: isMobile ? 'column' : 'row',

// Calendar panel:
width: isMobile ? '100%' : '380px',
position: isMobile ? 'relative' : 'sticky',

// Right column:
maxHeight: isMobile ? 'none' : 'calc(100vh - 120px)',
```

- [ ] **Step 2: Add narrow-viewport fallback for the hero**

```jsx
// Hero body two-column:
flexDirection: isMobile ? 'column' : 'row',

// Poster image on mobile — hide it on small screens to save space:
display: isMobile ? 'none' : 'flex',
```

- [ ] **Step 3: Check calendar density colours on white background**

The density colours were tuned for dark backgrounds. On white they may be too pale. Find `getDensityStyle` and check the lightest density level. If it's invisible on white, bump the opacity:

```jsx
// Example fix for lowest density:
// Before: background: 'rgba(139, 92, 246, 0.15)'
// After:  background: 'rgba(139, 92, 246, 0.25)'
```

- [ ] **Step 4: Verify no console errors**

Open browser devtools, check for:
- Missing `key` props warnings
- Any `undefined` variable references from removed components
- Image 404 for `/venues-poster.png`

Fix any issues found.

- [ ] **Step 5: Final visual walkthrough**

Check each section:
- [ ] Hero: nav, headline, strips, poster, scroll CTA
- [ ] Stats strip: counters, hot dates, category pills
- [ ] Calendar: sticky, density colours visible, clicking filters right list
- [ ] Event list: search works, cards styled, empty state shows
- [ ] Mobile: stacks vertically, poster hidden

- [ ] **Step 6: Commit**

```bash
git add src/EventPulse.jsx
git commit -m "feat: responsive layout and visual polish"
```

---

### Task 13: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
cd /Users/macintosh/Documents/GitHub/eventpulse
git push origin main
```

- [ ] **Step 2: Monitor Vercel deploy**

Open the Vercel dashboard and watch the build log. Expected build time: ~30–60 seconds.

```
Frontend: https://eventpulse-ednedbs9o-wetmuds-projects.vercel.app
```

- [ ] **Step 3: Smoke test on production URL**

- [ ] Hero section loads with venue poster image
- [ ] Stats strip visible
- [ ] Calendar renders
- [ ] Event list renders (may be empty if Phase 2 backend sync hasn't run)

- [ ] **Step 4: Final commit message if any last fixes needed**

```bash
git add src/EventPulse.jsx
git commit -m "fix: production smoke test fixes"
git push origin main
```

---

## Summary

| Task | What | File |
|------|------|------|
| 1 | Copy venue poster image | `public/venues-poster.png` |
| 2 | Add THEME palette constants | `src/EventPulse.jsx` |
| 3 | Convert root container to light | `src/EventPulse.jsx` |
| 4 | Convert all card/panel/text styles | `src/EventPulse.jsx` |
| 5 | Add hero wrapper + nav | `src/EventPulse.jsx` |
| 6 | Add hero headline, strips, poster | `src/EventPulse.jsx` |
| 7 | Replace stats dashboard with strip | `src/EventPulse.jsx` |
| 8 | Two-column main layout skeleton | `src/EventPulse.jsx` |
| 9 | Vertical event list + search | `src/EventPulse.jsx` |
| 10 | Restyle EventCard for light theme | `src/EventPulse.jsx` |
| 11 | Remove DateBubble + carousel | `src/EventPulse.jsx` |
| 12 | Responsive + polish | `src/EventPulse.jsx` |
| 13 | Deploy | Vercel |
