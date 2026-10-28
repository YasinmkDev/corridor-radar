# Swat Raah — Corridor Radar

A unified dual-mode React Native (Expo SDK 57, TypeScript) app for shared local
transport in Swat, KPK, Pakistan. One app, two modes, one live corridor state:

- **Passenger Mode ("Sawari")** — a live corridor radar as a vehicle list on a
  timeline: approaching vehicles with ETAs, seat counts, and Family/Ladies
  Seat availability, then raise your hand (**Hath Uthao**) at your stop.
  Pick your stop and direction from the bottom sheet; a driver claim turns
  the radar into the **Ride Locked** handshake screen.
- **Driver Cockpit ("Ustad")** — shift setup (route direction, dispatch token,
  starting empty seats, family row), then a live cockpit: current stop, empty
  seats stepper, **ROAD AHEAD RADAR** with per-stop **I'M COMING** claims,
  return demand at the terminal, Spot Sawari pins, and 1-tap road alerts.

No Google Maps, no Mapbox, no paid APIs, no backend, no GPS. All data is
simulated locally so the full passenger→driver handshake can be tested on one
phone in Expo Go.

UI built from the user's own design screens (Warm Apricot Corridor theme:
cream canvas #FFFBF5, white cards with 1px #FED7AA borders, coral #EA580C
CTAs, family indigo #4338CA; Plus Jakarta Sans headlines + Inter body via
expo-font + Google Fonts, system-font fallback if loading fails). Screens are
composed from the reusable library in `src/components/` — no screen
duplicates button/card/chip/sheet styles.

## Corridors (live simulation)

- **Mingora ⇄ Matta:** Mingora General Stand (0 km) → Kanju Chowk (5) →
  Dherai (9) → Kabal Chowk (13) → Sirsinai (17) → Matta General Stand (22).
- **Mingora ⇄ Bahrain:** Mingora / Fizagat (0) → Charbagh Chowk (11) →
  Khwazakhela Bypass (27) → Fatehpur (36) → Madyan Stand (48) → Bahrain
  Bazaar (58).

The fares directory additionally lists Mingora–Malam Jabba (40 km) and
Mingora–Peshawar–Islamabad as directory-only corridors (no live simulation).

## Screens and routes

Welcome (`/`) → phone (`/phone`) → OTP (`/otp`) → passenger setup
(`/setup-passenger`) or driver setup (`/setup-driver`) → tabs:
Corridors (`/(tabs)/corridors`), Radar (`/(tabs)/radar`, passenger radar or
driver shift/cockpit by current role), Fares (`/(tabs)/fares`), Account
(`/(tabs)/account`). The radar screen also hosts the stop/direction picker
sheet and the Ride Locked view; the cockpit hosts the Spot Sawari / road
alert sheet.

Tab mapping: Corridors = corridor list (two live corridors first, then
directory corridors as info-only rows) tapping into that corridor's radar;
Radar = passenger radar or driver cockpit by role; Fares = corridors +
official fares directory; Account = trust profile + role switcher.

## How to run

```bash
npm install
npx expo start
```

Then open the project in **Expo Go** (scan the QR code) or press `w` for web.
No native build, no dev-client build, no account needed.

Useful commands:

```bash
node --stack-size=8000 ./node_modules/typescript/bin/tsc --noEmit   # typecheck (plain tsc overflows its stack once react-native-web types enter the program)
npx eslint .       # lint
npx expo-doctor    # dependency/config diagnosis
npx expo export --platform android --max-workers 1   # single-platform bundle proof
```

## How to test the passenger → driver handshake

1. Complete welcome → phone (any valid PK number) → OTP (any 4 digits) →
   passenger setup (name, corridor, boarding stop). Demo-only: nothing is
   actually sent or verified.
2. On the radar, keep the default stop (Kabal Chowk on Mingora ⇄ Matta) and
   tap **Raise Hand at Kabal Chowk (Hold Seats)**.
3. Switch to **Ustad Mode** from Account. The radar tab now shows driver
   shift setup; tap **GO LIVE ON ROAD RADAR**.
4. In the cockpit, the **ROAD AHEAD RADAR** shows Kabal Chowk demand. Tap
   **I'M COMING — HOLD PASSENGERS** on that row.
5. Switch back to **Sawari Mode** from Account. The radar tab now shows
   **RIDE LOCKED & CONFIRMED**: Ustad Gul holding your seats, with a live ETA.
   **Cancel Hold** releases the seats back to the radar; **Mark Trip
   Complete** ends the trip.

## Notes

- Live-vs-sample data: vehicle ETAs, driver names/plates/trips, waiting
  counts, and active-vehicle counts on live screens come from the engine and
  seed data; they intentionally differ from the design mockups' sample
  figures (Ustad Tariq, 420 trips, 18 waiting, 45 km/h, and so on). Design
  copy that is display text (not live data) is reproduced exactly.
- Demo-only flows (no backend exists): phone auth, OTP, KYC verified state,
  locked-screen Call/WhatsApp (no-ops), voice note (shows "Voice note ready",
  no recording), rate-violation report (confirmation only).
- Known omissions vs the design screens (see DESIGN_SPEC §14.5): cockpit GPS
  speed (no speed source), top-bar menu/tune/SOS/edit icons (no designed
  destinations), "Passed 14m ago" node (no time source), spotter by-lines.
- Subscription-stability guard (from the 2026-10-28 crash fix): never pass a
  filter/map-derived array or freshly built object to `useCorridorStore`;
  subscribe to raw stable state and derive lists in `useMemo`. Re-audited
  2026-10-28 in DESIGN_SPEC §14.7.
