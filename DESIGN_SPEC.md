# Swat Raah — UX Research & Visual Design Specification

## 1. The problem, stated plainly

On fixed Swat corridors, two kinds of blindness cause failed trips:

- **Drivers (Ustads)** abort trips halfway because they cannot see whether passengers
  wait at upcoming stops, or whether return passengers wait at the final stand.
- **Passengers (Sawari)** at roadside stops cannot see where approaching cars are,
  how many empty seats they carry, or whether a Ladies/Family Seat is free.

Swat Raah answers both with one shared, local-first corridor state and two modes
in a single app binary. No maps, no GPS, no backend, no paid APIs.

## 2. Benchmark adaptations

### inDrive — role switching + peer identity cards
- **Taken:** one app, instant Passenger ⇄ Driver toggle; transparent identity
  (driver name, vehicle, plate, verification).
- **Adapted:** mode switching never resets corridor state, so the
  passenger→driver handshake can be tested on one phone: raise a hand at Kabal
  Chowk, switch to Driver Cockpit, see the amber alert ahead, claim it.
- **Adapted for KPK:** a "Verified Adda" badge replaces star-only trust, because
  the adda (stand) is the institution drivers and passengers already trust.
  Plates render in KPK style (`SWAT-4821`) in a bordered plate box.

### Citymapper / Tokyo Metro — 1D linear route visualization
- **Taken:** stops as sequential nodes on one line; vehicles as pills moving
  between nodes; ETAs from stops-away.
- **Adapted:** a vertical corridor timeline replaces the 2D map entirely. This
  kills map-tile data use (the real cost on mountain roads), kills battery
  drain from continuous GPS, and stays readable in bright sunlight and on a
  bumpy dashboard mount. ETAs are deterministic: stops-away × 4 minutes.

### Uber Shuttle / SWVL — seat inventory + cultural safety
- **Taken:** exact remaining capacity (`3 Seats Left`) instead of vague
  "available" states.
- **Adapted:** a dedicated **Family / Ladies Seat** badge (Royal Indigo) that is
  a first-class filter on both sides: passengers can require it when raising a
  hand; drivers can offer it with one tap. Seat counts change only through
  steppers and 1-tap cards, never typing.

### Waze — 1-tap road intelligence
- **Taken:** oversized, thumb-reachable action sheets; zero typing while moving.
- **Adapted:** driver footer actions are single taps with fixed outcomes:
  **Spot Sawari on Road** drops a sighting pin for the driver behind;
  **Road Alert** offers exactly three structured tags (Landslide/Block, Traffic
  Jam, Mechanic SOS) pinned to the driver's current stop. Nothing to type, ever.

## 3. KPK constraints that shaped the design

- **Bright mountain sunlight:** Light Mode default on crisp Alabaster with
  near-black ink; no thin grey text for anything load-bearing. Driver Night Mode
  is Deep Slate, for dawn/dusk driving.
- **Bumpy dashboard mounts:** minimum 56px touch targets everywhere, 64px for
  driver primary actions; giant −/+ seat steppers; no precision gestures.
- **One-handed thumb use:** all primary actions live in the bottom bar (passenger)
  or in thumb-reach cards (driver); the corridor selector and mode switcher sit
  at the top but are set-and-forget, not tapped mid-trip.
- **Low-data pockets:** zero network calls. All state is local; vehicles move on
  a timer; nothing downloads. The app works fully offline and in Expo Go.

## 4. Color tokens (flat only — no gradients, no glow, no blur)

| Token | Value | Use |
| --- | --- | --- |
| Canvas (light) | `#F8FAFC` | Passenger background |
| Night (dark) | `#0F172A` | Driver Cockpit background |
| Night card | `#1E293B` | Driver cards |
| Ink | `#0F172A` | Primary text (light mode) |
| Ink secondary | `#475569` | Secondary text (light mode) |
| Hairline | `#E2E8F0` | Borders (light mode) |
| Emerald | `#059669` | Non-text accents only: dots, borders, icons on white (white text on it is 3.77:1 — fails AA, so it is never a button fill or text color) |
| Emerald action | `#064E3B` | Primary action fills + every selected pill (AAA 9.72 with white text) |
| Emerald text | `#064E3B` | Text on light surfaces and on emerald tint (AAA) |
| Emerald bright | `#10B981` | Accents on dark surfaces (AA, not AAA — never for load-bearing dark text) |
| Emerald light | `#6EE7B7` | Text on dark surfaces (AAA on night card) |
| Emerald tint | `#D1FAE5` | Seat/verified chip backgrounds |
| Amber | `#D97706` | Icon on white only (3.19:1, passes non-text 3:1); never text on tint (2.86:1 — fails even 3:1) |
| Amber deep | `#92400E` | Icons on amber tint (AAA on white) |
| Amber text | `#78350F` | Text on amber tint and white (AAA) |
| Amber bright | `#F59E0B` | SOLID amber highlights for waiting stops/pings (never a blur or shadow glow) |
| Amber tint | `#FEF3C7` | Waiting chip backgrounds |
| Indigo | `#4F46E5` | Family / Ladies Seat badge (AA on tint; superseded for fills by Indigo text) |
| Indigo text | `#312E81` | Family toggle/pill fills and chip text (AAA 11.42 with white, 9.27 on tint) |
| Indigo tint | `#E0E7FF` | Family badge chip background |
| Danger | `#DC2626` | Never text (3.95:1 on tint, 3.03:1 on night card — both fail AA) |
| Danger text | `#7F1D1D` | Alert text on danger tint (AAA) |
| Danger light | `#FCA5A5` | Alert text and icons on dark surfaces (AAA on night card) |

Note on the brief's wording: "glowing track" and "glows amber" are implemented as
**solid amber fills and borders**. There is no shadow, blur, or gradient anywhere.

## 5. Typography hierarchy

| Level | Size / weight | Use |
| --- | --- | --- |
| Display | 28 / 800 | App title |
| Title | 20 / 800 | Section headings, card titles |
| Subtitle | 16 / 700 | Vehicle names, radar titles |
| Body | 16 / 400 | Explanatory copy, confirmations |
| Body bold | 16 / 700 | Emphasis copy |
| Button | 16 / 700 | Every button and primary-action label (one size, one weight) |
| Step | 32 / 800 | Stepper glyphs (−/+) only |
| Loud | 48 / 800 | The product's ONE loud moment: the driver's glanceable seat numeral. Nothing else uses this size. |
| Small | 14 / 400 | Meta lines, footnotes |
| Small bold | 14 / 700 | Pills, chips, toggles |
| Tiny | 12 / 600 | Badges, km labels, meta |
| Plate | 14 / 800, 1.5 letter-spacing | KPK plate boxes |

System fonts only (no font downloads, no Expo Font dependency).

## 6. Touch-target and micro-interaction rules

1. Every tappable element is at least 56px tall; driver primary actions
   (Raise Hand, I'm Coming, Next Stop, seat steppers) are 64px.
2. Zero text input during trips: steppers, pills, toggles, and 1-tap cards only.
3. Every action has an immediate, visible state change in the same session:
   raising a hand turns the bottom bar into an amber radar card; claiming turns
   the passenger card into a green "Ride Locked" card; seat steppers update the
   number and every card that shows it.
4. No action is a dead end: a disabled state always explains itself
   ("No waiting passengers ahead to hold right now").
5. Danger and demand are never color-only: amber waiting chips carry the word
   "Waiting", full vehicles carry the word "Full", alerts carry their tag text.
6. Bilingual micro-copy: clean English first, with familiar Roman Urdu/Pashto
   transport terms alongside (Sawari, Ustad, Khali Seat, Hath Uthao, Rasta).
   No Urdu script is required, so no font or shaping risk.

## 7. State model (summary; see `src/store/useCorridorStore.ts`)

- `ActiveVehicles`: currentStopIndex, progress (0 / 0.5 toward the next stop),
  direction (UP toward the final stand, DOWN toward Mingora), availableSeats,
  hasFamilySeat, vehicleType, driverName, plateNumber, verifiedAdda, rating,
  tripsCompleted, capacity, isMine (the vehicle the user drives per corridor).
- `RoadsidePings`: stopIndex, direction, passengerCount, needsFamilySeat,
  claimedByVehicleId, source (`hand` = passenger raised it, `spotted` = a driver
  saw people on the road), createdAt, expiresAt (30 min).
- `RoadAlerts`: stopIndex, tag, createdAt, expiresAt (30 min).
- Simulation tick (every 4 s): non-user vehicles advance half a stop and flip
  direction at termini; expired pings and alerts are removed, and seats held by
  an expired claimed ping are restored to its vehicle. If the user's own hand
  expires, the tick sets `expiredNotice` (corridor, stop, direction, seats,
  family need) instead of silently dropping the hand; the passenger screen shows
  a one-tap "Raise hand again" banner. The user's vehicle moves only via the
  driver's **Next Stop** button.
- The passenger's standing stop is remembered per corridor
  (`myStopByCorridor`), so switching corridors never moves the other corridor's
  standing stop. The user's own hand is remembered per corridor the same way.
- Holds release cleanly from every path: driver **Release hold**, passenger
  **Cancel hold**, passenger **Trip complete**, and ping expiry all restore the
  held seats (clamped to capacity) and return unclaimed pings to the radar.
- `completedTrip` (driver, vehicle, plate, seats) is the designed trip ending:
  the passenger screen shows a thank-you card with a single Done dismissal.
- ETA: stops-away × 4 minutes, derived from the timeline, never from GPS.

## 8. UX polish pass (2026-10-27) — how the half-finished refactor was resolved

The polish started from a half-done, build-breaking refactor in four files
(theme, types, seed, store): `myStopIndex` had been replaced by
`myStopByCorridor` but was still referenced in `index.tsx` and the store, and
five declared actions had no implementation. Decision: **complete the refactor
(path a), not revert it**, for four recorded reasons:

1. Per-corridor stop memory fixes a real retention defect: the old code clamped
   a single shared stop on corridor switch, silently moving the passenger's
   standing stop. The new shape remembers each corridor's stop.
2. `expiredNotice` and `completedTrip` are the designed expired and success
   states the state matrix requires (an expired hand must never vanish silently;
   a finished trip must end on a designed close, per the peak–end rule).
3. `releaseHold` fixes a documented limitation: held seats were never restored
   when a hold ended (see §9, bug class H-1).
4. The theme expansion (dark text tokens, spacing scale, motion tokens,
   `loud`/`step` type entries) was coherent progress, and its comments were
   verified against measured contrast ratios before being kept.

Implemented to complete it: a `selectMyStopIndex` selector used by `index.tsx`,
`raiseHand`, and `selectApproaching`; all five missing actions (`releaseHold`,
`completeTrip`, `dismissCompletedTrip`, `dismissExpiredNotice`,
`raiseAgainFromNotice` — the last restores corridor, direction, stop, seat
count, and family need exactly, and clears the notice); tick-time seat restore
for expired claimed pings for all vehicles; seat restore on `cancelHand`; and
`raiseHand` clearing any stale expired notice. One deliberate extension beyond
the half-done shape: the notice type also stores `needsFamilySeat`, so a
re-raise restores the exact original hand instead of dropping the family need.

## 9. Audit findings — fixed vs waived

Measured with a relative-luminance contrast script (WCAG ratios, not estimates).
All ratios below are measured.

### Fixed

- **C-1 (biggest finding): white text on emerald `#059669` = 3.77:1 — fails AA
  text.** Every emerald button/pill fill in the app was non-compliant. Fix: all
  primary fills and all selected pills now use `emeraldAction #064E3B`
  (9.72, AAA); mid emerald is reserved for non-text accents.
- **C-2: emerald text on emerald tint = 3.32:1 — fails AA text.** All chip text
  on tints now uses the dark text tokens (`emeraldText` 8.57, `amberText` 8.15,
  `indigoText` 9.27, `dangerText` 8.20 — all AAA). Amber icons on amber tint
  measured 2.86:1 (fails even the 3:1 non-text floor) and now use `amberDeep`.
- **C-3: danger text on night card = 3.03:1 — fails AA.** Driver active alerts
  and alert icons now use `dangerLight` (7.71, AAA); holding text now uses
  `emeraldLight` (9.60, AAA) instead of `emeraldBright` (5.77, AA).
- **C-4: direction pills used an ink fill, invisible on the night background.**
  Fixed by unifying all selected pills to `emeraldAction`.
- **C-5: selected-state grammar was three different fills** (emerald, ink,
  indigo). Now one rule: selected = `emeraldAction` everywhere; toggles ON use
  `indigoText` (11.42, AAA) instead of indigo (6.29, AA).
- **S-1: off-scale spacing** (18px pill padding, 10px gaps, 6px gaps, 20px
  paddings, 2px margins). All padding/gap/margin values are now on the
  4/8/12/16/24/32/48/64 scale, verified by grep. Card interiors are ≥24px on
  content surfaces (VehicleCard, DriverCockpit cards, banners, empty card);
  screen margins stay 16px and the passenger sheet keeps 16px horizontal to
  match the screen margin.
- **S-2: hardcoded values outside tokens** (`#FFFFFF`, `#E2E8F0`, `#0F172A`,
  hardcoded 32/36 stepper glyphs and 48/56 seat numeral). All moved to tokens;
  greps confirm zero hex literals, zero `fontSize`/`lineHeight` outside
  `theme.ts`, zero shadow/gradient/blur APIs.
- **S-3: button styles exceeded three.** Now exactly three: Primary
  (`emeraldAction` fill, white text), Secondary (hairline outline, ink/night
  text), Tertiary (text row, e.g. Cancel hold / Dismiss). Selectors and
  toggles are separate pill grammar, not button styles. Spot Sawari changed
  from an amber fill to a secondary outline so amber stays purely a
  demand-signal color.
- **H-1 (correctness bug, same class as the old README limitation): held seats
  leaked.** Cancelling a claimed hold, completing a trip, releasing a hold, or
  letting a claimed ping expire all restore seats now (clamped to capacity).
- **X-1: expiry was invisible.** Timeline ping/alert chips and driver alert
  lines now show "N min left" from the store clock; the passenger radar card
  already showed "Expires in N min".
- **X-2: expired hands vanished silently.** Now an amber banner with
  "Raise hand again" (one tap, restores the exact hand) and Dismiss.
- **X-3: locked rides had no ending.** Now a "Trip complete" primary button
  produces the thank-you success card (the designed peak ending).
- **X-4: approaching-empty state was one muted line.** Now a teaching card:
  what is happening, why, and that the bar below is the one action.
- **X-5: no freshness signal.** The header LIVE badge is now dark-aware and
  shows "Updated HH:MM" from the store clock; if ticks ever stop, the stamp
  freezes visibly instead of pretending liveness.
- **X-6: fare before commitment was missing.** Vehicle cards now show
  "Est. fare PKR 30/40 per stop · Demo rate, not a real tariff" from
  `Corridor.farePerStop` (30 Matta, 40 Bahrain — clearly labelled demo rates,
  not a tariff; replace with real tariff data before any real-world use).
- **A-1: unlabeled controls.** Stepper glyph buttons, toggles, mode/corridor/
  direction/stop pills, and banner actions now carry `accessibilityLabel`s.
- **A-2: state by color alone.** Verified: every chip carries words (Waiting,
  Held by, Full, Family, Spotted, tag text); dots are redundant with text
  labels. No state in the app is color-only.
- **A-3: dead controls.** Verified none: every visible control performs its
  action in place. The only non-button texts ("No waiting passengers ahead",
  "No one waiting") are explanatory states, not controls.
- **P-1: press feedback.** Every Pressable now dims to opacity 0.65 on
  pointer-down — instant (<100ms), no timed animation, per the frequency rule
  (the most-tapped actions get the least animation).
- **P-2: haptics.** `expo-haptics` (Expo Go-compatible, installed via the local
  SDK 57 CLI) wired only where meaningful: selection ticks on mode/corridor/
  direction/stop/seat/toggle/stepper/spot/alert/release changes, success
  notifications on raise, claim (only when a claim actually lands), and trip
  complete. No generic press haptics; haptics are never the sole channel.

### Waived, with reasons

- **W-1: mode switcher stays in the header, not the thumb zone.** The research
  notes bottom placement for primary actions, but the switcher is set-and-
  forget (not tapped mid-trip), is 56px, and moving it would displace the
  passenger bottom bar. The trip actions themselves are all bottom-anchored.
- **W-2: loading / error / offline states.** Not applicable by architecture:
  the app is fully local and synchronous — no network, no async fetch, no
  spinner can exist. The simulated-data footnote plus the Updated stamp are
  the honesty mechanism instead. A real backend would need these states.
- **W-3: header + corridor selector are shared across modes, so the driver
  screen also shows passenger-flavored header copy.** Accepted: the header is
  the mode switch itself, and the cockpit cards below it are fully driver-
  flavored. Splitting the header would duplicate the switcher.
- **W-4: ETA precision.** ETAs stay stops-away × 4 min (a range would be more
  honest, but the simulation has no variance model; the "~" prefix and the
  visible vehicle movement make the estimate checkable, which is the honest
  substitute here).
- **W-5: no audio/haptic-only or Pashto/Urdu voice summaries.** Research
  recommends audio backing for low-literacy users, but this build has no audio
  pipeline and no verified local-language recordings; inventing TTS copy would
  be guessing. Icon + short label + words carry every essential fact instead.
- **W-6: no real-device sunlight / mount / bumpy-road test.** Cannot be run
  from this container; remains a pre-launch check on a real phone at noon.

### Flows, tap counts (all ≤3 to the core job)

Raise hand: 2 (pick seats → Raise). Claim: 2 (switch mode → I'M COMING).
Spot Sawari: 1. Road alert: 1. Next stop: 1. Seat adjust: 1. Release hold: 1.
Re-raise after expiry: 1. Trip complete: 1. Nothing exceeds 3 taps.

## 10. Token & component grammar after polish

- **Spacing:** one scale, 4/8/12/16/24/32/48/64. Borders/hairlines (1–3px) and
  fixed geometry (dots, tracks, stepper width) are exempt. Verified by grep.
- **Radii:** card 16 (content cards, large action blocks), pill 999 (selectors,
  switcher, toggle pills), chip 10 (data chips, badges).
- **Type ladder:** display 28, title 20, subtitle 16/700, body 16/400,
  bodyBold 16/700, button 16/700 (every button label), small 14/400,
  smallBold 14/700, tiny 12/600, plate 14/800 +1.5 tracking, step 32/800
  (stepper glyphs only), loud 48/800 (driver seat numeral only).
- **Buttons:** max three styles (Primary fill, Secondary outline, Tertiary
  text). Hero actions (Raise, Claim, Next Stop, Trip complete) are 64px;
  other primaries 56px; all other targets ≥56px.
- **Motion:** no timed animation ships. Press feedback is an instant opacity
  change (<100ms). The `motion` tokens (press 150, fast 175, base 275,
  stagger 40, maxSequence 500) govern any future timed motion: exits shorter
  than enters, stagger totals ≤500ms first screenful only, never a spring on
  a progress indicator, most-tapped actions least animation.
- **Reduced Motion:** trivially satisfied — there is no spatial motion to
  convert; all feedback is instant state change. Any future timed motion must
  degrade to crossfades with durations compressed to 100–150ms.
- **Haptics:** see §9 P-2. Helper at `src/lib/haptics.ts`.
- **Badges:** every badge changes a decision or it does not ship. Verified
  Adda (trust), Unverified (warning), rating + trips (trust), Family (safety
  need), Spotted (provenance), plate (roadside matching), LIVE + Updated stamp
  (freshness). No decorative badges.

## 11. Part 8 pre-delivery audit (Design Mastery)

| Check | Result |
| --- | --- |
| Token sheet exists; every screen built from it; no orphan values | PASS — greps: zero hex, zero fontSize/lineHeight outside theme.ts |
| One accent spent only on primary actions and live state | PASS — emeraldAction on primaries/selected; amber only for demand signals; indigo only for family |
| One loud typographic moment; everything else conversational | PASS — `loud` used only for the driver seat numeral |
| Radii vocabulary respected | PASS — card/pill/chip jobs as §10 |
| Three button styles maximum | PASS — Primary / Secondary / Tertiary |
| References named per screen | PASS — inDrive, Citymapper, Uber Shuttle/SWVL, Waze (§2) |
| Each first screen exactly one primary verb | PASS — passenger: Raise Hand; driver: I'M COMING |
| Card interiors ≥24px on content surfaces | PASS — VehicleCard, cockpit cards, banners, empty card |
| No text touches/crosses a card edge at realistic lengths | PASS by construction — flex-wrap chip rows, wrapping text; long names wrap (no truncation hacks) |
| All five states designed per data surface | PASS with W-2 waiver — loading/error/offline N/A by local architecture; empty, expired, success, disabled-explained all designed |
| Badges ≤2 per screen, each changes a decision | WAIVED as counted — VehicleCard shows up to 4 chips, but each is decision-critical (seats, family, ETA, verified) and the playbook's cap targets decorative badges; all chips here change the wait/board decision |
| No dead controls | PASS — every control acts in place with <100ms feedback |
| Core loop in Part 4.2 form | PASS — trigger (passenger waiting / driver moving) → ≤1-tap action (Raise / I'M COMING) → variable reward (ETA + locked seats, varying by corridor and driver) → investment (the held seat both sides can see) → cycle time one trip |
| Investment visible, countable, losable, with mercy valve | PASS — held seats visible on both screens; losable on expiry/cancel; mercy valve is one-tap re-raise |
| Minimum keep-alive action tiny | PASS — one tap to re-raise |
| One engineered peak per session; sessions end on a designed summary | PASS — Ride Locked is the peak; Trip complete thank-you card is the ending |
| Users trigger each other | PASS — the product is two-sided by construction (hand ↔ claim) |
| Personalization grade chosen | Declared only: standing stop + corridor + direction remembered per corridor; no inferred/invisible personalization (no data to infer from) |
| Thank-you audit line on every mechanic | PASS — no dark patterns: Cancel always as easy as Raise, no fake scarcity (counts are real), no pre-ticked extras, no shaming copy |
| Social proof real or absent | PASS — ratings/trip counts are seed demo data, labelled simulated in the footnote; no fabricated live counts |
| Motion within tokens; exits shorter than enters; springs only where allowed | PASS — no timed motion ships at all |
| Frequency rule honored | PASS — most-tapped actions get instant feedback only |
| Haptics follow 6.8 taxonomy | PASS — selection ticks + success notifications only |
| Reduced Motion path verified | PASS — no spatial motion exists to convert |
| Unverifiable claims labelled practice/estimate, never platform spec | PASS — fares labelled demo rates; ETAs carry "~"; data labelled simulated |

## 12. Part 3 strategy audit (UX Strategy, summary)

- **Friction:** core jobs ≤3 taps (see §9); no flow asks for info the app has
  (stop/direction/seats are remembered); no screen loses input on
  mode/corridor switch; the only wait is the 4s simulation tick, which is
  visible as vehicle movement, not a spinner.
- **First value:** real value on first open with zero signup — the corridor,
  vehicles, and radar are live immediately; the Aha action is "Raise Hand"
  (one named action, not a feature tour); empty states teach and point at the
  one next action.
- **Retention:** one Hook loop drawn (waiting passenger → 1-tap hand →
  locked seats + ETA → held seat both sides see); progress (standing stop,
  corridor, direction) persists across mode switches and is recoverable after
  expiry via one-tap re-raise; unfinished business (an expired hand) resurfaces
  as a banner on home, not buried. No 14-day resurrection path yet — no
  backend, no notifications; waived as architecture, not design.
- **Feeling:** peak moment is Ride Locked (big confirmation, success haptic,
  driver + ETA + seats); ending is the Trip complete thank-you card; no
  algorithmic-intimacy sentence exists yet (no user history to compute from —
  honest absence, not a fake); three repeat decisions automated: standing stop
  remembered, corridor/direction remembered, seat count remembered.
- **Growth:** no viral surface by design (a two-sided transport tool grows by
  corridor density, not invites); no "powered by" surfaces; social proof is
  seed-only and labelled simulated.
- **Craft:** references named (§2); tokens defined with no one-off values
  (greps clean); all applicable states designed (§9, W-2 waiver); targets
  ≥56px; state never by color alone; icon buttons labelled; no dark patterns;
  no neon/gradient/glass styling anywhere.

## 13. Map rebuild (2026-10-28) — schematic corridor map replaces the timeline

Reference: `~/workspace/research_notes/swat-raah-map-design-20261028-1112/report.md`
(research across Google Maps, Apple Maps, Citymapper, Moovit, Uber, Lyft; §6 is
the build spec). Its pixel values are STARTING TOKENS from secondary sources,
not official platform specs — nothing here is claimed to come from Google or
Apple, and nothing is claimed about Grab/Careem/Bolt (unconfirmed).

### What changed

- **New `src/components/RouteMap.tsx`** — the hero visual, both orientations.
  Vertical passenger map (viewBox 360×560, spine x=84, top padding 32, track
  440) and horizontal driver strip (viewBox 400×112, spine y=56, left padding
  16, track 368). One straight spine scaled by kilometres:
  `y = topPadding + km/totalKm × trackLength` — NOT equal spacing. A km ruler
  (0 / mid / total ticks) and the on-canvas label "Schematic · stops spaced by
  kilometres · simulated" say so plainly. Static SVG layer is `React.memo`;
  ~35–45 SVG elements; no SVG filters, gradients, shadows, or glow.
- **New `src/components/MapHeader.tsx`** — floating header card: corridor
  chips "A · Matta" / "B · Bahrain", day/night toggle (passenger only), and the
  Passenger|Driver segmented switch. Driver mode is always night, so the toggle
  hides there.
- **New `src/lib/mapGeometry.ts`** — pure helpers, no React, no store:
  `vehicleKm` (continuous km from stop index + progress), `kmFraction`,
  `fitRect` (meet/mid fit math mirroring preserveAspectRatio, so native
  overlays land exactly on SVG geometry), `laneOffsets` (sideways offset when
  vehicles share a segment), `nextStopIndexFor`, `passedIndices`, `etaDetail`.
- **New `src/lib/stopNames.ts`** — `SHORT_NAMES` + `shortStopName`, moved
  verbatim out of the retired StopPills.
- **Retired:** `CorridorTimeline.tsx`, `StopPills.tsx`, `ModeSwitcher.tsx`,
  `CorridorSelector.tsx`. The map nodes ARE the stop selector now (tap a node
  to stand there); the header card carries corridor/mode switching. No dead
  code left behind (verified by grep).
- **`src/app/index.tsx`** — flex-column layout: header zone / map flex:1 /
  bottom sheet. The sheet starts COLLAPSED (grabber + ETA headline + fixed
  `PassengerBar`) so the map stays the hero — the first version let the sheet
  grow to its 55% cap and starved the map to ~170px on a phone-sized screen
  (caught on a real web capture, 2026-10-28). Tapping the grabber/ETA row
  expands it to scrolling details (capped at 55% height); selecting a vehicle
  marker or a banner appearing (trip-complete, expired hand) auto-expands it.
  Driver mode: header + scroll + `DriverCockpit`.
- **`src/components/DriverCockpit.tsx`** — horizontal map strip on top (demand
  ahead only, stops behind greyed out), then per-demand Claim rows 56 high,
  nearest first, return-stand demand last. The single big I'M COMING button is
  gone; each row claims its own ping. Seat deck, family toggle, Next Stop,
  claimed + Release hold, Spot Sawari, road alerts all kept.
- **`src/components/PassengerBar.tsx`** — new `dark` prop (night sheet
  surfaces; banner tints stay light for readability).
- **`src/store/useCorridorStore.ts`** — `claimNextPing` (claim-nearest) replaced
  by `claimPing(pingId)` (claim one specific ping, same seat-decrement floor
  0, returns boolean). Handshake is otherwise unchanged.
- **`src/app/_layout.tsx`** — root background is now the day map canvas
  (passenger) / night (driver); the screen itself covers it anyway.
- **Tokens added (`src/theme.ts`):** mapCanvasDay #F2EFE9, mapCanvasNight
  #12151C, mapGridDay #D8D2C7, mapGridNight #232A38, mapTrackDay #D9D2C6,
  mapTrackNight #2A3140, sheetNight #1C212E, corridorA #0E7490 (cyan-700),
  corridorB #BE185D (rose-700), seatsBadge #15803D; type entries mapLabel,
  mapMeta, mapMicro, mapTag, mapRuler, etaHeadline; radius.sheet 24.

### Node, colour, and marker system (as built)

- Passed = small filled node + muted label; upcoming = hollow muted-ring node;
  next = large white node + corridor ring + slow pulse (1600ms loop, static
  under reduced motion); selected (standing stop) = large node + ink outline +
  canvas halo; termini = rounded squares with white inner dot.
- Demand = amber ring + count badge (never colour alone); family need = indigo
  diamond with white "F"; road alert = red "!" badge. Behind-greying (strip
  only): stops behind the driver's vehicle render at 0.3 opacity.
- Corridor colours are used ONLY for the route line + corridor chip, always
  paired with letter + name. The line colour NEVER changes with state. Status
  hues stay reserved: seats green, demand amber, family indigo.
- Measured contrast (relative-luminance script, 2026-10-28): cyan-700 on paper
  4.67, rose-700 on paper 5.26, white-on-cyan-700 5.36, white-on-rose-700 6.04,
  seats green on white 5.02 (all AA); on night canvas the corridor lines pass
  only the 3:1 non-text floor (3.41 / 3.03), so the night line renders 1 unit
  thicker (11 vs 10).
- Vehicle markers are native views (not SVG): white pill, ink outline, vehicle
  glyph (Hiace Coach→Bus, Suzuki Carry→Truck, Fielder→Car), corridor-coloured
  nose triangle rotated to travel direction, green seats pill below ("Full" in
  grey at 0 seats, never red), family diamond on the pill. Lead marker carries
  an ETA pill above it; the driver's own marker is an inverted ink pill on the
  strip. Markers GLIDE: on each target change the transform animates from the
  previous target over 1200ms (0ms under reduced motion); only the transform
  animates, never fill/stroke. Selected marker gets a 2.5px border.
- ETA: map pill ("4 min" / "Arriving now") + sheet headline ("Arrives in ~4
  min" + "2 stops · 5 km away · Towards [end stop]"). Always "~" for simulated
  estimates, always paired with stops/km.

### Layout deviations from the research spec, and why

- **Flex column instead of absolute overlay positioning.** The spec's floating
  header + sheet over the canvas assumed a fixed sheet height in viewBox units;
  that breaks across screen sizes (sheet height is content-driven, viewBox
  units are not). The built layout stacks header / map / sheet in one column
  with the root background set to the canvas colour, so the visual result is
  identical (header pill and rounded sheet corners sit on seamless canvas,
  nothing hides behind chrome) without the size mismatch.
- **No direction chevron on the route line.** Direction is carried by the sheet
  header text ("Towards [end stop]"), the direction pills, and the destination
  line in the header card — a spec-sanctioned alternative that avoids a
  moving chevron competing with the gliding markers.
- **Strip markers glide too** (same native overlay system as vertical), rather
  than snapping, so there is exactly one marker system to maintain.

### Part 8 audit for the rebuild

| Check | Result |
| --- | --- |
| Token sheet; no orphan values | PASS — greps: zero hex outside theme.ts; all type sizes are theme entries (mapLabel/mapMeta/mapMicro/mapTag/mapRuler/etaHeadline); spacing values all on the scale except border/stroke geometry (1–3px, exempt) |
| One accent on primaries/live state | PASS — emeraldAction on primaries/selected; corridor colours only on line + chip |
| One loud typographic moment | PASS — `loud` still only the driver seat numeral; the ETA headline is title-size (20/800), not loud-size |
| Radii vocabulary | PASS — card/pill/chip/sheet jobs unchanged |
| Three button styles maximum | PASS — Primary / Secondary / Tertiary; Claim rows are Primary in compact form |
| References named | PASS — map research report §6 + §2 benchmarks |
| One primary verb per first screen | PASS — passenger: Raise Hand; driver: I'M COMING (now per-row, same verb) |
| Card interiors ≥24px | PASS — banners, VehicleCard, empty card keep 24px; the sheet gutter is 16px, matching the previous screen's scroll gutter |
| No text touches a card edge | PASS by construction — wrapping text, flex rows, no truncation hacks |
| All five states per surface | PASS with prior W-2 waiver — map adds selected/lead/demand/alert states; loading/error/offline still N/A (local architecture) |
| Badges ≤2 per screen | WAIVED as counted (extended) — the map carries demand counts, family diamonds, alert badges, seats badges, and the ETA pill, but every one changes a wait/board/claim decision; none is decorative |
| No dead controls | PASS — every node, marker, chip, pill, and row acts in place |
| Core loop in Part 4.2 form | PASS — unchanged loop; claim is now per-row but the same one-tap action |
| Investment visible/countable/losable + mercy valve | PASS — unchanged (held seats both screens; expiry/cancel; one-tap re-raise) |
| One engineered peak; designed ending | PASS — Ride Locked peak; Trip complete thank-you ending |
| Motion within tokens | PASS with note — NEW timed motion ships: marker glide (1200ms, transform-only, one axis) and pulse rings (1600ms loop). Both collapse to static under reduced motion (0ms glide, no pulse loop). Exits (selection clear) are instant |
| Haptics 6.8 | PASS — selection ticks + success only; stop/marker/direction taps tick, raise/claim/complete succeed |
| Reduced Motion path verified | PASS — pulse loop skipped, glide duration 0, everything else static |
| Unverifiable claims labelled | PASS — "~" ETAs, "Schematic · stops spaced by kilometres · simulated" on the canvas, demo fare note, simulated-data footnote |

### Subscription-stability audit (2026-10-28, post-rebuild)

The 2026-10-28 crash guard still holds: every `useCorridorStore` subscription
takes a raw stable value (scalar, stable object, or raw array) and every
derived list is built in `useMemo`. Audited subscriptions:

- `index.tsx`: mode, corridorId, direction, selectMyStopIndex (selector
  returning a number), seatCount, needsFamilySeat, expiredNotice,
  completedTrip, nowMs, raw vehicles/pings/alerts arrays, selectMyPing
  (selector returning one object or null); derived vehicles/pings/alerts/
  approaching all in `useMemo`; all action functions (stable references).
- `DriverCockpit.tsx`: corridorId, selectMyVehicle (selector returning one
  vehicle), raw vehicles/pings/alerts arrays, nowMs; derived corridor
  arrays, radar (`getForwardRadar` in `useMemo`), claim rows, claimedByMe,
  alertsHere all in `useMemo`; action functions.
- `PassengerBar.tsx`: nowMs only.
- `RouteMap.tsx`: no store subscription at all (all data via props).
- `_layout.tsx`: mode only.
- No component passes a filter/map result or a freshly built object to
  `useCorridorStore`. New map derivations (marker fractions, lane offsets,
  vehicle positions) are computed in `useMemo` from raw props, never from
  store selectors.

### Tooling note (2026-10-28)

- `react-native-web` was installed (`expo install react-native-web`, SDK 57
  compatible) because the web export — and the app's own "press `w` for web"
  path — cannot bundle without it. It changes nothing for Android/iOS builds
  (verified: Android export still 6.2MB, doctor still 21/21).
- Plain `npx tsc --noEmit` now crashes the TypeScript checker with
  "Maximum call stack size exceeded" once react-native-web's types enter the
  program. This is a checker-recursion quirk, not a code error: with a larger
  stack the same check passes clean —
  `node --stack-size=8000 ./node_modules/typescript/bin/tsc --noEmit`.
  That is the verified typecheck command for this repo from here on.
