import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, Eye, Mountain, Navigation, Wrench } from 'lucide-react-native';

import { corridorById } from '../data/seed';
import { success, tick } from '../lib/haptics';
import { shortStopName } from '../lib/stopNames';
import { colors, radius, touch, typeScale } from '../theme';
import type { AlertTag, Ping } from '../types';
import {
  getForwardRadar,
  minutesLeft,
  selectMyVehicle,
  useCorridorStore,
} from '../store/useCorridorStore';
import { RouteMap } from './RouteMap';

const ALERT_TAGS: { tag: AlertTag; icon: typeof Mountain }[] = [
  { tag: 'Landslide/Block', icon: Mountain },
  { tag: 'Traffic Jam', icon: Car },
  { tag: 'Mechanic SOS', icon: Wrench },
];

type ClaimRow = {
  ping: Ping;
  stopIndex: number;
  distanceKm: number | null;
  isReturn: boolean;
};

export function DriverCockpit() {
  const corridorId = useCorridorStore((s) => s.corridorId);
  const mine = useCorridorStore(selectMyVehicle);
  // Same rule as HomeScreen: raw state arrays are stable references, and
  // every derived list is memoized from them. Filtering directly inside
  // useCorridorStore returns a new array on every check and loops React.
  const allVehicles = useCorridorStore((s) => s.vehicles);
  const allPings = useCorridorStore((s) => s.pings);
  const allAlerts = useCorridorStore((s) => s.alerts);
  const corridorVehicles = useMemo(
    () => allVehicles.filter((v) => v.corridorId === corridorId),
    [allVehicles, corridorId],
  );
  const corridorPings = useMemo(
    () => allPings.filter((p) => p.corridorId === corridorId),
    [allPings, corridorId],
  );
  const corridorAlerts = useMemo(
    () => allAlerts.filter((a) => a.corridorId === corridorId),
    [allAlerts, corridorId],
  );
  const radar = useMemo(
    () => getForwardRadar(mine, allPings, corridorId),
    [mine, allPings, corridorId],
  );
  // Claim rows: nearest claimable demand first, return-stand demand last.
  // getForwardRadar already returns only unclaimed pings.
  const claimRows = useMemo<ClaimRow[]>(() => {
    const rows: ClaimRow[] = [];
    radar.ahead.forEach((stop) => {
      stop.pings.forEach((ping) => {
        rows.push({ ping, stopIndex: stop.stopIndex, distanceKm: stop.distanceKm, isReturn: false });
      });
    });
    radar.returnDemand.forEach((ping) => {
      rows.push({ ping, stopIndex: ping.stopIndex, distanceKm: null, isReturn: true });
    });
    return rows;
  }, [radar]);
  const claimedByMe = useMemo(
    () => allPings.filter((p) => p.claimedByVehicleId === mine.id),
    [allPings, mine.id],
  );
  const alertsHere = useMemo(
    () => allAlerts.filter((a) => a.corridorId === corridorId),
    [allAlerts, corridorId],
  );
  const nowMs = useCorridorStore((s) => s.nowMs);
  const adjustMySeats = useCorridorStore((s) => s.adjustMySeats);
  const toggleMyFamilySeat = useCorridorStore((s) => s.toggleMyFamilySeat);
  const advanceMyVehicle = useCorridorStore((s) => s.advanceMyVehicle);
  const claimPing = useCorridorStore((s) => s.claimPing);
  const releaseHold = useCorridorStore((s) => s.releaseHold);
  const spotSawari = useCorridorStore((s) => s.spotSawari);
  const addRoadAlert = useCorridorStore((s) => s.addRoadAlert);

  const corridor = corridorById(corridorId);
  const currentStop = corridor.stops[mine.currentStopIndex];
  const step = mine.direction === 'UP' ? 1 : -1;
  const nextIndex = mine.currentStopIndex + step;
  const atTerminus = nextIndex < 0 || nextIndex >= corridor.stops.length;
  const nextStopName = atTerminus
    ? corridor.stops[mine.currentStopIndex].name
    : corridor.stops[nextIndex].name;

  return (
    <View style={styles.wrap}>
      {/* Seat & status deck */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your vehicle · Ustad {mine.driverName.replace(/^Ustad /, '')}</Text>
        <Text style={styles.cardMeta}>
          {mine.vehicleType} · {mine.plateNumber}
          {mine.verifiedAdda ? ' · Verified Adda' : ''} · Now at {currentStop.name}
        </Text>
        <Text style={styles.seatLabel}>Khali Seat · Empty Seats Left</Text>
        <View style={styles.seatRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="One fewer empty seat"
            onPress={() => { tick(); adjustMySeats(-1); }}
            style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.seatNumber}>{mine.availableSeats}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="One more empty seat"
            onPress={() => { tick(); adjustMySeats(1); }}
            style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Family seat available, ${mine.hasFamilySeat ? 'on' : 'off'}`}
          onPress={() => { tick(); toggleMyFamilySeat(); }}
          style={({ pressed }) => [
            styles.familyToggle,
            mine.hasFamilySeat && styles.familyToggleOn,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[styles.familyToggleText, mine.hasFamilySeat && styles.familyToggleTextOn]}
          >
            {mine.hasFamilySeat ? 'Family Seat Available ✓' : 'Family Seat: Off — tap to offer'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            atTerminus ? `Turn around at ${shortStopName(nextStopName)}` : `Next stop, ${shortStopName(nextStopName)}`
          }
          onPress={() => { tick(); advanceMyVehicle(); }}
          style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
        >
          <Navigation size={20} color={colors.white} />
          <Text style={styles.nextButtonText}>
            {atTerminus ? `Turn around at ${shortStopName(nextStopName)}` : `Next Stop → ${shortStopName(nextStopName)}`}
          </Text>
        </Pressable>
      </View>

      {/* Forward road radar: map strip + per-demand Claim rows */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Forward Road Radar · No blind spots</Text>
        <Text style={styles.cardMeta}>
          Going {mine.direction === 'UP' ? `toward ${corridor.to}` : `toward ${corridor.from}`} · Stops
          behind you are greyed out · Amber = waiting passengers
        </Text>
        <View style={styles.stripCard}>
          <RouteMap
            corridor={corridor}
            vehicles={corridorVehicles}
            pings={corridorPings}
            alerts={corridorAlerts}
            myStopIndex={-1}
            selectedStopIndex={null}
            myVehicleId={mine.id}
            leadVehicleId={mine.id}
            etaForLead={null}
            dark
            orientation="horizontal"
            interactive={false}
            selectedVehicleId={null}
          />
        </View>
        {claimRows.length === 0 ? (
          <Text style={styles.muted}>
            No waiting passengers ahead to hold right now. Keep driving — new hands appear on the strip.
          </Text>
        ) : (
          claimRows.map((row) => (
            <View key={row.ping.id} style={styles.claimRow}>
              <View style={styles.claimInfo}>
                <Text style={styles.claimStop}>
                  {corridor.stops[row.stopIndex].name}
                  {row.ping.needsFamilySeat ? ' · Family' : ''}
                </Text>
                <Text style={styles.claimMeta}>
                  {row.ping.passengerCount} waiting
                  {row.isReturn
                    ? ' · Return trip · Final stand'
                    : row.distanceKm !== null
                      ? ` · ${row.distanceKm} km ahead`
                      : ''}
                  {' · '}
                  {minutesLeft(row.ping.expiresAt, nowMs)} min left
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Claim ${row.ping.passengerCount} waiting passengers at ${shortStopName(corridor.stops[row.stopIndex].name)}, I am coming`}
                onPress={() => { if (claimPing(row.ping.id)) success(); }}
                style={({ pressed }) => [styles.claimRowButton, pressed && styles.pressed]}
              >
                <Text style={styles.claimRowButtonText}>I&apos;M COMING</Text>
              </Pressable>
            </View>
          ))
        )}
        {claimedByMe.length > 0 ? (
          <>
            <Text style={styles.holdingText}>
              You are holding seats for{' '}
              {claimedByMe.map((p) => shortStopName(corridor.stops[p.stopIndex].name)).join(', ')} — the
              passenger screen is updated.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Release hold, seats go back to radar"
              onPress={() => { tick(); releaseHold(); }}
              style={({ pressed }) => [styles.releaseButton, pressed && styles.pressed]}
            >
              <Text style={styles.releaseButtonText}>Release hold · seats go back to radar</Text>
            </Pressable>
          </>
        ) : null}
      </View>

      {/* Brotherhood footer */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Brotherhood · Help the driver behind you</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Spot sawari on road at your current stop"
          onPress={() => { tick(); spotSawari(); }}
          style={({ pressed }) => [styles.spotButton, pressed && styles.pressed]}
        >
          <Eye size={20} color={colors.amberBright} />
          <Text style={styles.spotText}>Spot Sawari on Road</Text>
        </Pressable>
        <Text style={styles.muted}>
          Car full? One tap drops a sighting pin at {currentStop.name} for the driver behind you.
        </Text>
        <Text style={[styles.cardTitle, styles.alertHeading]}>Road Alert · 1 tap, no typing</Text>
        <View style={styles.alertRow}>
          {ALERT_TAGS.map(({ tag, icon: Icon }) => (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityLabel={`Report ${tag}`}
              onPress={() => { tick(); addRoadAlert(tag); }}
              style={({ pressed }) => [styles.alertButton, pressed && styles.pressed]}
            >
              <Icon size={18} color={colors.dangerLight} />
              <Text style={styles.alertButtonText}>{tag}</Text>
            </Pressable>
          ))}
        </View>
        {alertsHere.map((a) => (
          <Text key={a.id} style={styles.activeAlert}>
            Active: {a.tag} at {shortStopName(corridor.stops[a.stopIndex].name)} ·{' '}
            {minutesLeft(a.expiresAt, nowMs)} min left
          </Text>
        ))}
      </View>
      <Text style={styles.footnote}>Simulated live data · No GPS, no maps, no backend.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { backgroundColor: colors.nightCard, borderRadius: radius.card, padding: 24, gap: 12 },
  cardTitle: { ...typeScale.subtitle, color: colors.nightText },
  cardMeta: { ...typeScale.small, color: colors.nightSecondary },
  seatLabel: { ...typeScale.smallBold, color: colors.nightSecondary, marginTop: 4 },
  seatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepButton: {
    width: 72,
    minHeight: touch.driverPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.night,
    borderRadius: radius.card,
  },
  stepText: { ...typeScale.step, color: colors.white },
  seatNumber: { ...typeScale.loud, color: colors.nightText },
  familyToggle: {
    minHeight: touch.standard,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.nightHairline,
    paddingHorizontal: 12,
  },
  familyToggleOn: { backgroundColor: colors.indigoText, borderColor: colors.indigoText },
  familyToggleText: { ...typeScale.smallBold, color: colors.nightSecondary, textAlign: 'center' },
  familyToggleTextOn: { color: colors.white },
  nextButton: {
    minHeight: touch.driverPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.emeraldAction,
    borderRadius: radius.card,
    paddingHorizontal: 12,
  },
  nextButtonText: { ...typeScale.button, color: colors.white, textAlign: 'center' },
  stripCard: { borderRadius: radius.card, overflow: 'hidden' },
  claimRow: {
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.nightHairline,
    borderRadius: radius.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  claimInfo: { flex: 1, gap: 2 },
  claimStop: { ...typeScale.smallBold, color: colors.nightText },
  claimMeta: { ...typeScale.tiny, color: colors.nightSecondary },
  claimRowButton: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: colors.emeraldAction,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
  },
  claimRowButtonText: { ...typeScale.smallBold, color: colors.white },
  muted: { ...typeScale.small, color: colors.nightSecondary },
  holdingText: { ...typeScale.smallBold, color: colors.emeraldLight },
  releaseButton: {
    minHeight: touch.standard,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.nightHairline,
    paddingHorizontal: 12,
  },
  releaseButtonText: { ...typeScale.smallBold, color: colors.nightText, textAlign: 'center' },
  spotButton: {
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.nightHairline,
  },
  spotText: { ...typeScale.button, color: colors.nightText },
  alertHeading: { marginTop: 4 },
  alertRow: { flexDirection: 'row', gap: 8 },
  alertButton: {
    flex: 1,
    minHeight: touch.standard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.nightHairline,
    paddingHorizontal: 4,
  },
  alertButtonText: { ...typeScale.tiny, color: colors.nightText, textAlign: 'center' },
  activeAlert: { ...typeScale.smallBold, color: colors.dangerLight },
  footnote: { ...typeScale.tiny, color: colors.nightSecondary, textAlign: 'center' },
  pressed: { opacity: 0.65 },
});
