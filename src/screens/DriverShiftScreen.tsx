import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  CarFront,
  Check,
  ChevronRight,
  LifeBuoy,
  Send,
  ShieldCheck,
  Store,
} from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { SeatStepper } from '../components/SeatStepper';
import { TileCard } from '../components/TileCard';
import { TopBar } from '../components/TopBar';
import { corridorById } from '../data/seed';
import { FARE_DIRECTORY } from '../data/faresDirectory';
import { formatPlate } from '../lib/format';
import { selectMyVehicle, useCorridorStore } from '../store/useCorridorStore';
import { useProfileStore } from '../store/useProfileStore';
import { colors, radius, typeScale } from '../theme';

/** Screen 8 — Driver shift setup / start trip. */
export function DriverShiftScreen() {
  const corridorId = useCorridorStore((s) => s.corridorId);
  const direction = useCorridorStore((s) => s.direction);
  const pings = useCorridorStore((s) => s.pings);
  const mine = useCorridorStore(selectMyVehicle);
  const setDirection = useCorridorStore((s) => s.setDirection);
  const adjustMySeats = useCorridorStore((s) => s.adjustMySeats);
  const toggleMyFamilySeat = useCorridorStore((s) => s.toggleMyFamilySeat);
  const setDriverLive = useProfileStore((s) => s.setDriverLive);

  const corridor = corridorById(corridorId);
  const directory = FARE_DIRECTORY.find((d) => d.liveId === corridorId);
  const isMatta = corridorId === 'mingora_matta';

  const waiting = useMemo(
    () =>
      pings
        .filter((p) => p.corridorId === corridorId && p.claimedByVehicleId === null)
        .reduce((sum, p) => sum + p.passengerCount, 0),
    [pings, corridorId],
  );
  const kabalWaiting = useMemo(
    () =>
      pings.some(
        (p) =>
          p.corridorId === corridorId &&
          p.claimedByVehicleId === null &&
          corridor.stops[p.stopIndex]?.name === 'Kabal Chowk',
      ),
    [pings, corridorId, corridor],
  );

  const summary = isMatta
    ? `${corridor.from}–${corridor.to} Route #4 • ${corridor.stops[corridor.stops.length - 1].km} km mountain corridor • ${directory?.activeCount ?? 14} Active Vehicles`
    : `${corridor.from}–${corridor.to} • ${corridor.stops[corridor.stops.length - 1].km} km ${directory?.meta ?? ''} • ${directory?.activeCount ?? 19} Active Vehicles`;

  return (
    <AppScreen>
      <TopBar right={<Chip label="● DRIVER LIVE" variant="apricot" />} />

      <Card>
        <View style={styles.profileHeader}>
          <ShieldCheck size={18} color={colors.primaryDeep} />
          <Text style={styles.profileHeaderTitle}>Active Driver Profile</Text>
          <View style={styles.avatar}>
            <LifeBuoy size={22} color={colors.primary} />
          </View>
        </View>
        <Text style={styles.greeting}>Assalam-o-Alaikum, {mine.driverName}</Text>
        <View style={styles.divider} />
        <View style={styles.vehicleRow}>
          <CarFront size={20} color={colors.primary} />
          <Text style={styles.vehicleType}>{mine.vehicleType}</Text>
          <View style={styles.plateChip}>
            <Text style={styles.plateText}>{formatPlate(mine.plateNumber)}</Text>
            <BadgeCheck size={14} color={colors.family} />
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Select Route Direction</Text>
          {isMatta ? <Text style={styles.corridorNo}>CORRIDOR #4</Text> : null}
        </View>
        <View style={styles.tileRow}>
          <TileCard
            icon={<ArrowUp size={22} color={colors.primary} />}
            title={`${corridor.from} → ${corridor.to}`}
            sub="(North / UP)"
            topRight={
              direction === 'UP' ? <Chip label="ACTIVE" variant="coral" /> : undefined
            }
            selected={direction === 'UP'}
            onPress={() => setDirection('UP')}
          />
          <TileCard
            icon={<ArrowDown size={22} color={colors.primary} />}
            title={`${corridor.to} → ${corridor.from}`}
            sub="(South / DOWN)"
            topRight={
              direction === 'DOWN' ? (
                <Chip label="ACTIVE" variant="coral" />
              ) : (
                <Text style={styles.returnLabel}>RETURN</Text>
              )
            }
            selected={direction === 'DOWN'}
            onPress={() => setDirection('DOWN')}
          />
        </View>
      </Card>

      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.dispatchLabelRow}>
        <Text style={styles.dispatchLabel}>Terminal / Dispatch Origin</Text>
        <Text style={styles.tokenActive}>Token Active</Text>
      </View>
      <Card>
        <View style={styles.dispatchRow}>
          <Store size={22} color={colors.primary} />
          <View style={styles.dispatchText}>
            <Text style={styles.dispatchTitle}>{corridor.stops[0].name}</Text>
            <Text style={styles.dispatchSub}>Queue Slot: Adda Token #12</Text>
          </View>
          <ChevronRight size={20} color={colors.muted} />
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Starting Empty Seats</Text>
        <Text style={styles.cardSub}>Available for road pickup</Text>
        <SeatStepper
          value={mine.availableSeats}
          onChange={(n) => adjustMySeats(n - mine.availableSeats)}
          variant="stepper"
          capacityLabel={`Total Capacity: ${mine.capacity}`}
        />
      </Card>

      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Front Family/Ladies Row"
        accessibilityState={{ checked: mine.hasFamilySeat }}
        onPress={toggleMyFamilySeat}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <Card>
          <View style={styles.familyRow}>
            <ShieldCheck size={22} color={colors.family} />
            <View style={styles.familyText}>
              <Text style={styles.familyTitle}>Front Family/Ladies Row</Text>
              <Text style={styles.familySub}>
                Keep front 2 seats prioritized for women &amp; families
              </Text>
            </View>
            {mine.hasFamilySeat ? (
              <Chip
                label="RESERVED"
                variant="green"
                icon={<Check size={12} color={colors.success} />}
              />
            ) : (
              <Chip label="Off" variant="grey" />
            )}
          </View>
        </Card>
      </Pressable>

      <Card>
        <Text style={styles.cardTitle}>Corridor Passenger Live Radar</Text>
        <Text style={styles.cardSub}>
          {waiting} Passengers currently waiting along corridor stops.
          {kabalWaiting ? ' High demand detected at Kabal Chowk.' : ''}
        </Text>
      </Card>

      <AppButton
        label="GO LIVE ON ROAD RADAR →"
        big
        leftIcon={<Send size={20} color={colors.white} />}
        onPress={() => setDriverLive(true)}
      />
      <Text style={styles.footnote}>
        Broadcasts your empty seats to waiting roadside passengers in real time.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileHeaderTitle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: 22,
  },
  greeting: { ...typeScale.display, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.cardBorder },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vehicleType: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  plateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.micro,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  plateText: { ...typeScale.labelMd, color: colors.ink },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardTitle: { ...typeScale.labelLg, color: colors.ink },
  cardSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  corridorNo: { ...typeScale.labelMd, color: colors.primary },
  returnLabel: { ...typeScale.labelMd, color: colors.muted },
  tileRow: { flexDirection: 'row', gap: 8 },
  summary: { ...typeScale.bodySm, color: colors.inkSecondary },
  dispatchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dispatchLabel: { ...typeScale.labelLg, color: colors.ink },
  tokenActive: { ...typeScale.labelMd, color: colors.primaryDeep },
  dispatchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dispatchText: { flex: 1, gap: 2 },
  dispatchTitle: { ...typeScale.labelLg, color: colors.ink },
  dispatchSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  familyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  familyText: { flex: 1, gap: 2 },
  familyTitle: { ...typeScale.labelLg, color: colors.ink },
  familySub: { ...typeScale.bodySm, color: colors.inkSecondary },
  footnote: { ...typeScale.bodySm, color: colors.muted, textAlign: 'center' },
  pressed: { opacity: 0.65 },
});
