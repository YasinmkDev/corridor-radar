import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  selectPingsOnCorridor,
  selectVehiclesOnCorridor,
  TICK_MS,
  useCorridorStore,
} from '../store/useCorridorStore';
import { colors, typeScale } from '../theme';

export default function HomeScreen() {
  const mode = useCorridorStore((s) => s.mode);
  const corridorId = useCorridorStore((s) => s.corridorId);
  const direction = useCorridorStore((s) => s.direction);
  const myStopIndex = useCorridorStore((s) => s.myStopIndex);
  const seatCount = useCorridorStore((s) => s.seatCount);
  const needsFamilySeat = useCorridorStore((s) => s.needsFamilySeat);
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
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE · Corridor Radar</Text>
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
            <Text style={styles.sectionTitle}>Standing at · Aap Kahan Khare Hain?</Text>
            <StopPills stops={corridor.stops} selected={myStopIndex} onSelect={setMyStop} dark={false} />
            <Text style={[styles.standing, { color: colors.inkSecondary }]}>
              Standing at: {myStop.name} ({myStop.km} km) · Going{' '}
              {direction === 'UP' ? `toward ${corridor.to}` : `toward ${corridor.from}`}
            </Text>

            <Text style={styles.sectionTitle}>Approaching you · Qareeb Aa Rahi Hain</Text>
            {approaching.length === 0 ? (
              <Text style={[styles.muted, { color: colors.inkSecondary }]}>
                No vehicles are heading toward {myStop.name} right now. Raise your hand so drivers
                ahead can see you.
              </Text>
            ) : (
              approaching.map(({ vehicle, etaMinutes }) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  etaMinutes={etaMinutes}
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
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typeScale.display },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.emeraldTint,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald },
  liveText: { ...typeScale.tiny, color: colors.emerald },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 12 },
  sectionTitle: { ...typeScale.subtitle, color: colors.ink, marginTop: 4 },
  standing: { ...typeScale.small },
  muted: { ...typeScale.body },
  footnote: { ...typeScale.small, marginTop: 8 },
});
