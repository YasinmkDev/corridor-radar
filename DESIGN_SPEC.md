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
| Emerald | `#059669` | Primary actions, available seats, verified |
| Emerald bright | `#10B981` | Accents, "holding" states |
| Emerald tint | `#D1FAE5` | Seat/verified chip backgrounds |
| Amber | `#D97706` | Demand text |
| Amber bright | `#F59E0B` | SOLID amber highlights for waiting stops/pings (never a blur or shadow glow) |
| Amber tint | `#FEF3C7` | Waiting chip backgrounds |
| Indigo | `#4F46E5` | Family / Ladies Seat badge |
| Indigo tint | `#E0E7FF` | Family badge chip background |
| Danger | `#DC2626` | Full vehicles, road alerts |

Note on the brief's wording: "glowing track" and "glows amber" are implemented as
**solid amber fills and borders**. There is no shadow, blur, or gradient anywhere.

## 5. Typography hierarchy

| Level | Size / weight | Use |
| --- | --- | --- |
| Display | 28 / 800 | App title |
| Title | 20 / 800 | Section headings, card titles |
| Subtitle | 16 / 700 | Vehicle names, radar titles |
| Body | 16 / 400 | Explanatory copy, confirmations |
| Body bold | 16 / 700 | Primary button labels |
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
  direction at termini; expired pings and alerts are removed. The user's vehicle
  moves only via the driver's **Next Stop** button.
- ETA: stops-away × 4 minutes, derived from the timeline, never from GPS.
