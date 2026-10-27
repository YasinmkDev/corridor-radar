# Swat Raah — Corridor Radar

A unified dual-mode React Native (Expo SDK 57, TypeScript) app for shared local
transport in Swat, KPK, Pakistan. One app, two modes, one live corridor state:

- **Passenger Mode ("Spot & Hold Your Ride")** — see approaching vehicles with
  ETAs, seat counts, and Family/Ladies Seat availability on a vertical corridor
  timeline, then raise your hand (**Hath Uthao**) at your stop.
- **Driver Cockpit ("Zero-Blindness Road Radar")** — see waiting passengers at
  the next 3 stops plus return demand at the final stand, hold them with one
  tap, adjust empty seats with giant steppers, spot roadside passengers for the
  driver behind you, and broadcast 1-tap road alerts.

No Google Maps, no Mapbox, no paid APIs, no backend, no GPS. All data is
simulated locally so the full passenger→driver handshake can be tested on one
phone in Expo Go.

## Corridors

- **Mingora ⇄ Matta:** Mingora General Stand (0 km) → Kanju Chowk (5) → Dherai
  (9) → Kabal Chowk (13) → Sirsinai (17) → Matta Mughal Khel Stand (22).
- **Mingora ⇄ Bahrain:** Mingora / Fizagat (0) → Charbagh Chowk (11) →
  Khwazakhela Bypass (27) → Fatehpur (36) → Madyan Stand (48) → Bahrain Bazaar (58).

## How to run

```bash
npm install
npx expo start
```

Then open the project in **Expo Go** (scan the QR code) or press `w` for web.
No native build, no dev-client build, no account needed.

Useful commands:

```bash
npx tsc --noEmit   # typecheck
npx eslint .       # lint
npx expo-doctor    # dependency/config diagnosis
npx expo export    # static bundle export
```

## How to test the passenger → driver handshake

1. Stay in **Passenger Mode** on the Mingora ⇄ Matta corridor.
2. Pick **Kabal** in the stop pills (or keep the default) and tap
   **Raise Hand at Kabal Chowk**. The bottom bar becomes an amber radar card.
3. Switch to **Driver Cockpit** with the top pill. The Forward Road Radar shows
   Kabal Chowk glowing amber with your waiting passengers.
4. Tap **I'M COMING — HOLD PASSENGERS**. The radar confirms you are holding seats.
5. Switch back to **Passenger Mode**. The bottom bar now shows the green
   **Ride Locked!** card: Ustad Gul (White Fielder) holding your seats, with an
   ETA.
6. Tap **Trip complete** on the locked card for the designed ending: a
   thank-you card you dismiss with Done.

Other things to try:

- **Seat steppers:** in Driver Cockpit, tap − / + and watch the seat counts
  update on every card that shows your vehicle.
- **Next Stop:** advances your vehicle one stop (it turns around at termini).
- **Spot Sawari on Road:** drops an amber "Spotted on road" pin at your current
  stop for the driver behind you.
- **Road Alert:** tap Landslide/Block, Traffic Jam, or Mechanic SOS to pin a
  structured alert to your current stop (visible on the timeline).
- **Corridor/direction switching:** state is kept per corridor, so switching
  corridors never loses the other corridor's vehicles, pings, or standing stop.
- **Live ticks:** other vehicles advance half a stop every 4 seconds and flip
  direction at termini; pings and alerts expire after 30 minutes.
- **Expiry + re-raise:** wait for your hand to expire (or shorten the expiry in
  the store while testing) and watch the amber "Your hand expired" banner
  appear — one tap on **Raise hand again** restores the exact hand.
- **Release hold:** in Driver Cockpit, after claiming, tap **Release hold** and
  watch the seats return and the ping go back to unclaimed on the radar.
- **Fare line:** each approaching vehicle card shows an estimated demo fare
  per stop (PKR 30 Matta, PKR 40 Bahrain) — labelled as a demo rate, not a
  real tariff.
- **Haptics:** on a real phone, mode/corridor/stop/seat/toggle changes give a
  light selection tick; raising a hand, claiming, and completing a trip give a
  success notification. No generic press buzz.

## Project layout

```
src/
  app/
    _layout.tsx        # Expo Router root (Stack, SafeArea, StatusBar)
    index.tsx          # Main screen: header, mode switcher, timeline, bottom bar
  components/
    ModeSwitcher.tsx       # Passenger / Driver segmented pill
    CorridorSelector.tsx   # Corridor + direction pills
    StopPills.tsx          # Horizontal stop selector
    CorridorTimeline.tsx   # Vertical 1D corridor track
    VehicleCard.tsx        # Trust card (plate, Verified Adda, seats, ETA)
    PassengerBar.tsx       # Hath Uthao bar, radar state, Ride Locked card
    DriverCockpit.tsx      # Seat deck, forward radar, claim, brotherhood footer
  store/
    useCorridorStore.ts    # Zustand store + tick engine + selectors + ETA math
  data/
    seed.ts                # Corridors, seed vehicles, seed pings
  lib/
    haptics.ts             # Selection ticks + success notifications only
  theme.ts                 # Color tokens, type scale, touch targets
  types.ts                 # Corridor / Vehicle / Ping / Alert types
```

## Honest limitations

- **Simulated everything:** vehicles move on a 4-second timer, not GPS. ETAs are
  stops-away × 4 minutes, not real travel times.
- **No backend, no accounts, no persistence:** state lives in memory and resets
  on reload. There is no real driver/passenger matching across phones.
- **One-phone demo:** the "user's vehicle" per corridor is a demo stand-in
  (Ustad Gul). Real multi-user behavior needs a backend, which is deliberately
  out of scope for this build.
- **Seat holds release cleanly:** cancelling a hold, completing a trip,
  releasing a hold, or letting a claimed ping expire all restore the held
  seats (clamped to capacity) and return unclaimed pings to the radar.
- **Demo fares:** the per-stop fare shown on vehicle cards (PKR 30/40) is a
  placeholder demo rate, not a real tariff. Replace with real tariff data
  before any real-world use.
- **No Urdu script:** micro-copy uses Roman Urdu/Pashto terms in Latin script
  only, so there are no font or text-shaping dependencies.
- **Design:** flat UI only — no gradients, no glow/blur effects. The brief's
  "glowing track" is implemented as solid amber highlights.
