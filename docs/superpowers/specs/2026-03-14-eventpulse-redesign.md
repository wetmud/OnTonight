# EventPulse — Full Redesign Spec
**Date:** 2026-03-14
**Approach:** Restructure in place (single `EventPulse.jsx` file, no new files)
**Scope:** Landing hero + full light-theme conversion + two-column app layout

---

## 1. Design Direction

### Reference
A Numenu-style editorial landing page: massive bold headline, warm beige background, full-bleed coloured horizontal strips as feature callouts. The entire app converts from dark to light — same warm beige palette throughout, no dark/light split.

### Colour Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#f0ebe3` | Page background |
| `--bg-card` | `#ffffff` | Cards, calendar panel |
| `--bg-strip` | `#e8e0d4` | Stats strip, alternate rows |
| `--border` | `#e5ddd4` | Card borders, dividers |
| `--text` | `#1a1a1a` | Primary text |
| `--text-muted` | `#6b6055` | Secondary text, labels |
| `--shadow` | `rgba(0,0,0,0.08)` | Card shadows |

Category colours (unchanged — they read well on light):
- Concerts: `#7c3aed` (purple)
- Festivals: `#ea580c` (orange)
- Theatre: `#0369a1` (steel blue)
- Comedy: `#d97706` (amber)
- Sports: `#16a34a` (green)
- Other: `#6b7280` (grey)

### Typography
- **Headline:** System bold stack — `'Inter', 'Helvetica Neue', Arial, sans-serif` — weight 900
- **Headline size:** `clamp(4rem, 9vw, 8.5rem)`, line-height `0.93`
- **Body:** Same stack, weight 400/500, `0.9rem`–`1rem`

---

## 2. Hero Section

**Height:** `100vh`
**Background:** `#f0ebe3`
**Layout:** Two columns — content left (~55%), poster image right (~45%)

### Nav
- Position: top of hero, full width
- Left: `EventPulse` wordmark in bold dark type + a small `· GTA` label in muted
- Right: `How it works` anchor link + `Sign in` placeholder button (outlined)
- No background, no shadow — sits flat on the beige

### Left Column
1. **Eyebrow label** — all-caps small text: `EVENTPULSE · GTA`
2. **Headline** — two lines:
   ```
   Events,
   organized.
   ```
   Massive, black weight, tight leading (~0.93), left-aligned.

3. **Subheadline** — `"Every GTA concert, festival, and show. One calendar."` — regular weight, `1.1rem`, muted colour, `margin-top: 1.5rem`

4. **Three coloured category strips** — stacked horizontally below the subhead, each `~66px` tall, full width of the left column:
   - Strip 1 — Concerts purple `#7c3aed`: label `"Concerts"` bold left + `"847 shows this month"` small right
   - Strip 2 — Festivals orange `#ea580c`: label `"Festivals & Outdoor"` + `"Across 28 GTA venues"`
   - Strip 3 — Steel blue `#0369a1`: label `"Theatre · Comedy · Sports"` + `"Updated daily from live sources"`
   - Text on strips is white. Labels are `1rem` bold, descriptors are `0.75rem` regular.

5. **Scroll CTA** — bottom of left column: centred `↓ Browse events` in `0.8rem` muted text, with a subtle CSS `translateY` bounce animation (`@keyframes bounce`, 1.5s infinite).

### Right Column
- The GTA venue poster image (`Gemini_Generated_Image_f3pwbbf3pwbbf3pw.png`) displayed as a contained artwork element
- Image path: referenced from `public/` folder (file to be copied there during implementation)
- Dimensions: ~`420px` wide × auto height, capped at `85vh`
- Styling: `border-radius: 8px`, `box-shadow: 0 12px 48px rgba(0,0,0,0.18)`
- Slight cream border: `3px solid #e8e0d4`
- Positioned slightly offset from the right edge for breathing room

---

## 3. Stats Strip

**Background:** `#e8e0d4`
**Position:** Immediately below the hero, full width
**Padding:** `1.5rem 2rem`

### Top row — four inline counters
Displayed horizontally with `·` separators:
- `[N] Events This Month`
- `28 Venues`
- `6 Categories`
- `4 Live Sources`

Values pulled from the same `useQuery` data already in the component. Style: number in bold `#1a1a1a`, label in muted `#6b6055`, `0.85rem`.

### Bottom row — Hot Dates + Category Breakdown
**Hot Dates** — a horizontally scrolling row of date chips. Each chip: `DD Mon` bold + event count badge. Chip background white, border `#e5ddd4`, rounded pill shape. The top 6 busiest dates shown.

**Category Breakdown** — pill tags with counts: `🎵 Concerts (247)`, `🎪 Festivals (89)`, etc. Same pill style, category colour as left border accent.

Both rows sit below the counters with `margin-top: 0.75rem`, separated by a thin `1px #d4ccc4` rule.

---

## 4. Main App — Two Column Layout

**Background:** `#f0ebe3` (continuous with the rest of the page)
**Layout:** `display: flex`, `align-items: flex-start`, `min-height: calc(100vh - [stats-strip-height])`

### Left Column — Calendar Panel
- **Width:** `380px` fixed (`flex-shrink: 0`)
- **Background:** `#ffffff`
- **Border-radius:** `12px`
- **Shadow:** `0 2px 16px rgba(0,0,0,0.08)`
- **Position:** `sticky`, `top: 1.5rem` — stays in view while right column scrolls
- **Contents (top to bottom):**
  1. Month nav — `← March 2026 →` in bold, arrow buttons
  2. Day-of-week headers — `S M T W T F S` in small muted caps
  3. Calendar grid — cells colour-coded by event density (existing logic, colours adapted: lighter tints on white background)
  4. Category filter pills — below the grid, horizontally scrollable

**Clicking a date** filters the right-side event list to that day. The DateBubble modal is removed — the right panel replaces its function.

### Right Column — Event List
- **Flex:** `1` (takes all remaining width)
- **Overflow-y:** `auto`
- **Max-height:** `calc(100vh - [nav+strip height])` — independently scrollable

**Sticky top bar** (sticks within the right column):
- Search input — full width, `#ffffff` background, `border: 1px solid #e5ddd4`, `border-radius: 8px`
- Category filter pills below the search — same as current but restyled for light theme
- Active date indicator: if a date is selected, shows `"Showing March 14 · 12 events  ✕ Clear"` in a small strip

**Event cards** — stacked vertically, `gap: 0.75rem`:
- Background: `#ffffff`
- Border-radius: `10px`
- Shadow: `0 1px 6px rgba(0,0,0,0.07)`
- Left edge accent: `4px solid [category colour]`
- Contents: time + title + venue name + category chip + like/notify/buy buttons
- Replace the horizontal discovery carousel — this vertical list is the primary event browsing surface

---

## 5. Removed / Relocated Elements

| Element | Was | Now |
|---------|-----|-----|
| Stats dashboard (top of app) | Full-width section above calendar | Merged into Stats Strip (section 3) |
| DateBubble modal | Floated over calendar on date click | Removed — right list filters instead |
| Discovery carousel | Horizontal scroll below calendar | Removed — vertical event list replaces it |
| Dark gradient background | `#0d0d1a` / deep gradients everywhere | `#f0ebe3` throughout |

---

## 6. Implementation Constraints

- **Single file:** All changes in `src/EventPulse.jsx`. No new files except moving the image to `public/`.
- **Inline styles:** Maintain the existing inline style pattern — do not introduce CSS files or CSS modules.
- **No new dependencies:** All layout is pure CSS (flexbox). No new npm packages.
- **Preserve all existing logic:** `normalizeApiEvent`, `getDensityStyle`, `useQuery` data fetching, category constants, like/notify state — all untouched. This is purely a layout and styling change.
- **Image:** Copy `Gemini_Generated_Image_f3pwbbf3pwbbf3pw.png` from `~/Downloads/` to `eventpulse/public/venues-poster.png` and reference as `/venues-poster.png`.

---

## 7. Scroll Behaviour

The page scrolls naturally top-to-bottom:
1. Hero (100vh)
2. Stats strip
3. Main app (calendar sticky left, list scrolls right)

No scroll-snap. No JS scroll hijacking. The `"↓ Browse events"` CTA uses a standard `scrollIntoView` anchor to jump to the main app section.
