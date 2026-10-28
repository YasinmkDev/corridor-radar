import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, Eye, Hand, Mountain, Navigation, Wrench } from 'lucide-react-native';

import { corridorById } from '../data/seed';
import { success, tick } from '../lib/haptics';
import { colors, radius, touch, typeScale } from '../theme';
import type { AlertTag } from '../types';
import {
  getForwardRadar,
  minutesLeft,
  selectMyVehicle,
  useCorridorStore,
} from '../store/useCorridorStore';
import { shortStopName } from './StopPills';

const ALERT_TAGS: { tag: AlertTag; icon: typeof Mountain }[] = [
  { tag: 'Landslide/Block', icon: Mountain },
  { tag: 'Traffic Jam', icon: Car },
  { tag: 'Mechanic SOS', icon: Wrench },
];

export function DriverCockpit() {
  const corridorId = useCorridorStore((s) => s.corridorId);
  const mine = useCorridorStore(selectMyVehicle);
  // Same rule as HomeScreen: raw state arrays are stable references, and
  // every derived list is memoized from them. Filtering directly inside
  // useCorridorStore returns a new array on every check and loops React.
  const allPings = useCorridorStore((s) => s.pings);
  const allAlerts = useCorridorStore((s) => s.alerts);
  const radar = useMemo(
    () => getForwardRadar(mine, allPings, corridorId),
    [mine, allPings, corridorId],
  );
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
  const claimNextPing = useCorridorStore((s) => s.claimNextPing);
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
  const claimable =
    radar.ahead.some((s) => s.pings.length > 0) || radar.returnDemand.length > 0;

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

      {/* Forward road radar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Forward Road Radar · No blind spots</Text>
        <Text style={styles.cardMeta}>
          Going {mine.direction === 'UP' ? `toward ${corridor.to}` : `toward ${corridor.from}`} · Next 3 stops
        </Text>
        {radar.ahead.length === 0 ? (
          <Text style={styles.muted}>You are at the end of the road. Turn around to head back.</Text>
        ) : (
          radar.ahead.map((stop) => (
            <View key={stop.stopIndex} style={styles.radarRow}>
              <View style={styles.radarStop}>
                <Text style={styles.radarStopName}>{corridor.stops[stop.stopIndex].name}</Text>
                <Text style={styles.radarKm}>{stop.distanceKm} km ahead</Text>
              </View>
              {stop.pings.length > 0 ? (
                <View style={styles.amberChip}>
                  <Text style={styles.amberChipText}>
                    {stop.pings.reduce((sum, p) => sum + p.passengerCount, 0)} Waiting
                    {stop.pings.some((p) => p.needsFamilySeat) ? ' · Family' : ''}
                  </Text>
                </View>
              ) : (
                <Text style={styles.muted}>No one waiting</Text>
              )}
            </View>
          ))
        )}
        {radar.returnDemand.length > 0 ? (
          <View style={styles.returnCard}>
            <Text style={styles.returnTitle}>
              Return demand at {corridor.stops[corridor.stops.length - 1].name} (final stand)
            </Text>
            <Text style={styles.returnBody}>
              {radar.returnDemand.reduce((sum, p) => sum + p.passengerCount, 0)} passengers waiting
              to come back — your return trip is covered.
            </Text>
          </View>
        ) : null}
        {claimable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="I am coming, hold passengers"
            onPress={() => { if (claimNextPing() !== null) success(); }}
            style={({ pressed }) => [styles.claimButton, pressed && styles.pressed]}
          >
            <Hand size={22} color={colors.white} />
            <Text style={styles.claimText}>I&apos;M COMING — HOLD PASSENGERS</Text>
          </Pressable>
        ) : (
          <Text style={styles.muted}>No waiting passengers ahead to hold right now.</Text>
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
  radarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  radarStop: { flex: 1 },
  radarStopName: { ...typeScale.smallBold, color: colors.nightText },
  radarKm: { ...typeScale.tiny, color: colors.nightSecondary },
  amberChip: { backgroundColor: colors.amberBright, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 8 },
  amberChipText: { ...typeScale.smallBold, color: colors.ink },
  muted: { ...typeScale.small, color: colors.nightSecondary },
  returnCard: { backgroundColor: colors.night, borderRadius: radius.chip, padding: 12, gap: 4 },
  returnTitle: { ...typeScale.smallBold, color: colors.nightText },
  returnBody: { ...typeScale.small, color: colors.nightSecondary },
  claimButton: {
    minHeight: touch.driverPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.emeraldAction,
    borderRadius: radius.card,
    paddingHorizontal: 12,
  },
  claimText: { ...typeScale.button, color: colors.white, textAlign: 'center' },
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
  pressed: { opacity: 0.65 },
});
