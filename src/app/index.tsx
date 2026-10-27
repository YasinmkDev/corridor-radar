import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CorridorSelector } from '../components/CorridorSelector';
import { CorridorTimeline } from '../components/CorridorTimeline';
import { DriverCockpit } from '../components/DriverCockpit';
import { ModeSwitcher } from '../components/ModeSwitcher';
import { PassengerBar } from '../components/PassengerBar';
import { StopPills } from '../components/StopPills';
import { VehicleCard } from '../components/VehicleCard';
import { corridorById } from '../data/seed';
import {
  selectApproaching,
  selectMyPing,
  selectMyStopIndex,
  selectPingsOnCorridor,
  selectVehiclesOnCorridor,
  TICK_MS,
  useCorridorStore,
} from '../store/useCorridorStore';
import { colors, radius, touch, typeScale } from '../theme';

export default function HomeScreen() {
  const mode = useCorridorStore((s) => s.mode);
  const corridorId = useCorridorStore((s) => s.corridorId);
  const direction = useCorridorStore((s) => s.direction);
  const myStopIndex = useCorridorStore(selectMyStopIndex);
  const seatCount = useCorridorStore((s) => s.seatCount);
  const needsFamilySeat = useCorridorStore((s) => s.needsFamilySeat);
  const expiredNotice = useCorridorStore((s) => s.expiredNotice);
  const completedTrip = useCorridorStore((s) => s.completedTrip);
  const nowMs = useCorridorStore((s) => s.nowMs);
  const vehicles = useCorridorStore(selectVehiclesOnCorridor);
  const pings = useCorridorStore(selectPingsOnCorridor);
  const alerts = useCorridorStore((s) =>
    s.alerts.filter((a) => a.corridorId === s.corridorId),
  );
  const approaching = useCorridorStore(selectApproaching);
  const myPing = useCorridorStore(selectMyPing);

  const setMode = useCorridorStore((s) => s.setMode);
  const setCorridor = useCorridorStore((s) => s.setCorridor);
  const setDirection = useCorridorStore((s) => s.setDirection);
  const setMyStop = useCorridorStore((s) => s.setMyStop);
  const setSeatCount = useCorridorStore((s) => s.setSeatCount);
  const setNeedsFamilySeat = useCorridorStore((s) => s.setNeedsFamilySeat);
  const raiseHand = useCorridorStore((s) => s.raiseHand);
  const cancelHand = useCorridorStore((s) => s.cancelHand);
  const raiseAgainFromNotice = useCorridorStore((s) => s.raiseAgainFromNotice);
  const dismissExpiredNotice = useCorridorStore((s) => s.dismissExpiredNotice);
  const dismissCompletedTrip = useCorridorStore((s) => s.dismissCompletedTrip);
  const completeTrip = useCorridorStore((s) => s.completeTrip);
  const tick = useCorridorStore((s) => s.tick);

  useEffect(() => {
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, [tick]);

  const corridor = corridorById(corridorId);
  const dark = mode === 'driver';
  const myStop = corridor.stops[myStopIndex];
  const claimingVehicle = myPing?.claimedByVehicleId
    ? (vehicles.find((v) => v.id === myPing.claimedByVehicleId) ?? null)
    : null;
  const stampDate = new Date(nowMs);
  const stamp = `${String(stampDate.getHours()).padStart(2, '0')}:${String(
    stampDate.getMinutes(),
  ).padStart(2, '0')}`;
  const noticeStop = expiredNotice
    ? corridorById(expiredNotice.corridorId).stops[expiredNotice.stopIndex]
    : null;

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: dark ? colors.night : colors.canvas }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: dark ? colors.nightText : colors.ink }]}>
            Swat Raah
          </Text>
          <View
            style={[
              styles.liveBadge,
              { backgroundColor: dark ? colors.nightCard : colors.emeraldTint },
            ]}
          >
            <View style={styles.liveDot} />
            <Text
              style={[
                styles.liveText,
                { color: dark ? colors.emeraldLight : colors.emeraldText },
              ]}
            >
              LIVE · Updated {stamp}
            </Text>
          </View>
        </View>
        <ModeSwitcher mode={mode} onChange={setMode} dark={dark} />
        <CorridorSelector
          corridorId={corridorId}
          onCorridor={setCorridor}
          direction={direction}
          onDirection={setDirection}
          fromLabel={corridor.from}
          toLabel={corridor.to}
          dark={dark}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'passenger' ? (
          <>
            {completedTrip ? (
              <View style={styles.successCard}>
                <Text style={styles.successTitle}>Shukriya · Trip complete</Text>
                <Text style={styles.successBody}>
                  You rode with {completedTrip.driverName} ({completedTrip.vehicleType} ·{' '}
                  {completedTrip.plateNumber}) — {completedTrip.passengerCount} seat
                  {completedTrip.passengerCount > 1 ? 's' : ''}. Thank you for travelling Swat
                  Raah.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
                  onPress={dismissCompletedTrip}
                  accessibilityLabel="Dismiss trip complete message"
                  accessibilityRole="button"
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              </View>
            ) : null}
            {expiredNotice && noticeStop ? (
              <View style={styles.expiredCard}>
                <Text style={styles.expiredTitle}>Your hand expired · Hath Neeche</Text>
                <Text style={styles.expiredBody}>
                  Your {expiredNotice.passengerCount} seat
                  {expiredNotice.passengerCount > 1 ? 's' : ''} hand at {noticeStop.name} expired
                  after 30 minutes. Raise it again in one tap.
                </Text>
                <View style={styles.bannerActions}>
                  <Pressable
                    style={({ pressed }) => [styles.raiseAgainButton, pressed && styles.pressed]}
                    onPress={raiseAgainFromNotice}
                    accessibilityLabel="Raise hand again at the same stop"
                    accessibilityRole="button"
                  >
                    <Text style={styles.raiseAgainButtonText}>Raise hand again</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.dismissButton, pressed && styles.pressed]}
                    onPress={dismissExpiredNotice}
                    accessibilityLabel="Dismiss expired hand notice"
                    accessibilityRole="button"
                  >
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
            <Text style={styles.sectionTitle}>Standing at · Aap Kahan Khare Hain?</Text>
            <StopPills stops={corridor.stops} selected={myStopIndex} onSelect={setMyStop} dark={false} />
            <Text style={[styles.standing, { color: colors.inkSecondary }]}>
              Standing at: {myStop.name} ({myStop.km} km) · Going{' '}
              {direction === 'UP' ? `toward ${corridor.to}` : `toward ${corridor.from}`}
            </Text>

            <Text style={styles.sectionTitle}>Approaching you · Qareeb Aa Rahi Hain</Text>
            {approaching.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No vehicles heading toward {myStop.name} yet
                </Text>
                <Text style={styles.emptyBody}>
                  Raise your hand so drivers ahead can see you. Use the bar below — pick your
                  seats, tap once, and you are on the radar.
                </Text>
              </View>
            ) : (
              approaching.map(({ vehicle, etaMinutes }) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  etaMinutes={etaMinutes}
                  farePerStop={corridor.farePerStop}
                  dark={false}
                />
              ))
            )}

            <Text style={styles.sectionTitle}>Corridor Timeline · Rasta</Text>
            <CorridorTimeline
              stops={corridor.stops}
              vehicles={vehicles}
              pings={pings}
              alerts={alerts}
              myStopIndex={myStopIndex}
              dark={false}
              nowMs={nowMs}
              driverNameFor={(id) => {
                const v = vehicles.find((x) => x.id === id);
                return v ? `Ustad ${v.driverName.replace(/^Ustad /, '')}` : null;
              }}
            />
            <Text style={[styles.footnote, { color: colors.inkSecondary }]}>
              Simulated live data · No GPS, no maps, no backend. Vehicles move on a timer so you can
              test the full handshake on one phone.
            </Text>
          </>
        ) : (
          <DriverCockpit />
        )}
      </ScrollView>

      {mode === 'passenger' ? (
        <PassengerBar
          stopName={myStop.name}
          seatCount={seatCount}
          onSeatCount={setSeatCount}
          needsFamilySeat={needsFamilySeat}
          onFamilySeat={setNeedsFamilySeat}
          myPing={myPing}
          claimingVehicle={claimingVehicle}
          onRaiseHand={raiseHand}
          onCancelHand={cancelHand}
          onCompleteTrip={completeTrip}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typeScale.display },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald },
  liveText: { ...typeScale.tiny },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 12 },
  sectionTitle: { ...typeScale.subtitle, color: colors.ink, marginTop: 4 },
  standing: { ...typeScale.small },
  footnote: { ...typeScale.small, marginTop: 8 },
  pressed: { opacity: 0.65 },
  successCard: {
    backgroundColor: colors.emeraldTint,
    borderRadius: radius.card,
    padding: 24,
    gap: 8,
  },
  successTitle: { ...typeScale.title, color: colors.emeraldText },
  successBody: { ...typeScale.body, color: colors.emeraldText },
  doneButton: {
    minHeight: touch.standard,
    borderWidth: 1,
    borderColor: colors.emeraldText,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  doneButtonText: { ...typeScale.button, color: colors.emeraldText },
  expiredCard: {
    backgroundColor: colors.amberTint,
    borderRadius: radius.card,
    padding: 24,
    gap: 8,
  },
  expiredTitle: { ...typeScale.title, color: colors.amberText },
  expiredBody: { ...typeScale.body, color: colors.amberText },
  bannerActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  raiseAgainButton: {
    flex: 1,
    minHeight: touch.standard,
    backgroundColor: colors.emeraldAction,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raiseAgainButtonText: { ...typeScale.button, color: colors.white },
  dismissButton: {
    minHeight: touch.standard,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: { ...typeScale.button, color: colors.amberText },
  emptyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.card,
    padding: 24,
    gap: 8,
  },
  emptyTitle: { ...typeScale.title, color: colors.ink },
  emptyBody: { ...typeScale.body, color: colors.inkSecondary },
});
