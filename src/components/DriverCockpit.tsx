import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, Eye, Hand, Mountain, Navigation, Wrench } from 'lucide-react-native';

import { corridorById } from '../data/seed';
import { colors, radius, touch, typeScale } from '../theme';
import type { AlertTag } from '../types';
import {
  selectForwardRadar,
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
  const radar = useCorridorStore(selectForwardRadar);
  const claimedByMe = useCorridorStore((s) =>
    s.pings.filter((p) => p.claimedByVehicleId === mine.id),
  );
  const alertsHere = useCorridorStore((s) =>
    s.alerts.filter((a) => a.corridorId === s.corridorId),
  );
  const adjustMySeats = useCorridorStore((s) => s.adjustMySeats);
  const toggleMyFamilySeat = useCorridorStore((s) => s.toggleMyFamilySeat);
  const advanceMyVehicle = useCorridorStore((s) => s.advanceMyVehicle);
  const claimNextPing = useCorridorStore((s) => s.claimNextPing);
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
            onPress={() => adjustMySeats(-1)}
            style={styles.stepButton}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.seatNumber}>{mine.availableSeats}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => adjustMySeats(1)}
            style={styles.stepButton}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={toggleMyFamilySeat}
          style={[styles.familyToggle, mine.hasFamilySeat && styles.familyToggleOn]}
        >
          <Text
            style={[styles.familyToggleText, mine.hasFamilySeat && styles.familyToggleTextOn]}
          >
            {mine.hasFamilySeat ? 'Family Seat Available ✓' : 'Family Seat: Off — tap to offer'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={advanceMyVehicle}
          style={styles.nextButton}
        >
          <Navigation size={20} color="#FFFFFF" />
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
            onPress={() => claimNextPing()}
            style={styles.claimButton}
          >
            <Hand size={22} color="#FFFFFF" />
            <Text style={styles.claimText}>I&apos;M COMING — HOLD PASSENGERS</Text>
          </Pressable>
        ) : (
          <Text style={styles.muted}>No waiting passengers ahead to hold right now.</Text>
        )}
        {claimedByMe.length > 0 ? (
          <Text style={styles.holdingText}>
            You are holding seats for{' '}
            {claimedByMe.map((p) => shortStopName(corridor.stops[p.stopIndex].name)).join(', ')} — the
            passenger screen is updated.
          </Text>
        ) : null}
      </View>

      {/* Brotherhood footer */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Brotherhood · Help the driver behind you</Text>
        <Pressable
          accessibilityRole="button"
          onPress={spotSawari}
          style={styles.spotButton}
        >
          <Eye size={20} color="#0F172A" />
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
              onPress={() => addRoadAlert(tag)}
              style={styles.alertButton}
            >
              <Icon size={18} color={colors.danger} />
              <Text style={styles.alertButtonText}>{tag}</Text>
            </Pressable>
          ))}
        </View>
        {alertsHere.map((a) => (
          <Text key={a.id} style={styles.activeAlert}>
            Active: {a.tag} at {shortStopName(corridor.stops[a.stopIndex].name)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { backgroundColor: colors.nightCard, borderRadius: radius.card, padding: 16, gap: 10 },
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
  stepText: { fontSize: 32, lineHeight: 36, fontWeight: '800', color: '#FFFFFF' },
  seatNumber: { fontSize: 48, lineHeight: 56, fontWeight: '800', color: colors.nightText },
  familyToggle: {
    minHeight: touch.standard,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.nightHairline,
    paddingHorizontal: 12,
  },
  familyToggleOn: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  familyToggleText: { ...typeScale.smallBold, color: colors.nightSecondary, textAlign: 'center' },
  familyToggleTextOn: { color: '#FFFFFF' },
  nextButton: {
    minHeight: touch.driverPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.emerald,
    borderRadius: radius.card,
    paddingHorizontal: 12,
  },
  nextButtonText: { ...typeScale.bodyBold, color: '#FFFFFF', textAlign: 'center' },
  radarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  radarStop: { flex: 1 },
  radarStopName: { ...typeScale.smallBold, color: colors.nightText },
  radarKm: { ...typeScale.tiny, color: colors.nightSecondary },
  amberChip: { backgroundColor: colors.amberBright, borderRadius: radius.chip, paddingHorizontal: 10, paddingVertical: 6 },
  amberChipText: { ...typeScale.smallBold, color: '#0F172A' },
  muted: { ...typeScale.small, color: colors.nightSecondary },
  returnCard: { backgroundColor: colors.night, borderRadius: radius.chip, padding: 12, gap: 2 },
  returnTitle: { ...typeScale.smallBold, color: colors.nightText },
  returnBody: { ...typeScale.small, color: colors.nightSecondary },
  claimButton: {
    minHeight: touch.driverPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.emerald,
    borderRadius: radius.card,
    paddingHorizontal: 12,
  },
  claimText: { ...typeScale.bodyBold, color: '#FFFFFF', textAlign: 'center' },
  holdingText: { ...typeScale.smallBold, color: colors.emeraldBright },
  spotButton: {
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.amberBright,
    borderRadius: radius.card,
  },
  spotText: { ...typeScale.bodyBold, color: '#0F172A' },
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
  activeAlert: { ...typeScale.smallBold, color: colors.danger },
});
