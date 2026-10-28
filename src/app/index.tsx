import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DriverCockpit } from '../components/DriverCockpit';
import { MapHeader } from '../components/MapHeader';
import { PassengerBar, SeatPicker } from '../components/PassengerBar';
import { RouteMap } from '../components/RouteMap';
import { VehicleCard } from '../components/VehicleCard';
import { corridorById } from '../data/seed';
import { tick as hapticTick } from '../lib/haptics';
import { vehicleKm } from '../lib/mapGeometry';
import {
  etaToStop,
  getApproachingVehicles,
  minutesLeft,
  selectMyPing,
  selectMyStopIndex,
  TICK_MS,
  useCorridorStore,
  vehiclePosition,
} from '../store/useCorridorStore';
import { colors, radius, touch, typeScale } from '../theme';
import type { CorridorId, Mode } from '../types';

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
  // Raw state arrays are stable references between store updates; every
  // derived list below is memoized from them. Filtering/mapping directly
  // inside useCorridorStore returns a new array on every check, which made
  // React re-render forever ("Maximum update depth exceeded", 2026-10-28).
  const allVehicles = useCorridorStore((s) => s.vehicles);
  const allPings = useCorridorStore((s) => s.pings);
  const allAlerts = useCorridorStore((s) => s.alerts);
  const vehicles = useMemo(
    () => allVehicles.filter((v) => v.corridorId === corridorId),
    [allVehicles, corridorId],
  );
  const pings = useMemo(
    () => allPings.filter((p) => p.corridorId === corridorId),
    [allPings, corridorId],
  );
  const alerts = useMemo(
    () => allAlerts.filter((a) => a.corridorId === corridorId),
    [allAlerts, corridorId],
  );
  const approaching = useMemo(
    () => getApproachingVehicles(allVehicles, corridorId, myStopIndex),
    [allVehicles, corridorId, myStopIndex],
  );
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

  // Passenger night mode: OS default, manually overridable. Driver is always night.
  const colorScheme = useColorScheme();
  const [nightOverride, setNightOverride] = useState<boolean | null>(null);
  const dark = mode === 'driver' ? true : (nightOverride ?? (colorScheme === 'dark'));
  const insets = useSafeAreaInsets();

  // Map selection: tapping a stop node stands the passenger there; tapping a
  // vehicle marker opens its card in the sheet. Background taps clear the card.
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  // The sheet starts collapsed (grabber + ETA + action bar only) so the map
  // stays the hero; details expand on tap. Selecting a vehicle auto-expands
  // so its card is visible.
  const [sheetExpanded, setSheetExpanded] = useState(false);
  // Banners must never hide behind a collapsed sheet: when a trip-complete
  // thank-you or an expired hand appears, force the sheet open. Render-phase
  // adjustment (React docs pattern): the banner flag is compared with the
  // previous render's flag, so this re-renders at most once per change, and
  // a manual collapse afterwards is never overridden.
  const [bannerWasPresent, setBannerWasPresent] = useState(false);
  const bannerPresent = completedTrip !== null || expiredNotice !== null;
  if (bannerPresent !== bannerWasPresent) {
    setBannerWasPresent(bannerPresent);
    if (bannerPresent) setSheetExpanded(true);
  }
  const handleStopTap = (index: number | null) => {
    if (index === null) {
      setSelectedVehicleId(null);
      return;
    }
    hapticTick();
    setMyStop(index);
    setSelectedVehicleId(null);
  };
  const handleVehicleTap = (id: string | null) => {
    if (id === null) {
      setSelectedVehicleId(null);
      return;
    }
    hapticTick();
    setSelectedVehicleId(id);
    setSheetExpanded(true);
  };
  const handleCorridor = (id: CorridorId) => {
    setSelectedVehicleId(null);
    setCorridor(id);
  };
  const handleMode = (m: Mode) => {
    setSelectedVehicleId(null);
    setMode(m);
  };

  const corridor = corridorById(corridorId);
  const canvas = dark ? colors.mapCanvasNight : colors.mapCanvasDay;
  const ink = dark ? colors.nightText : colors.ink;
  const secondary = dark ? colors.nightSecondary : colors.inkSecondary;
  const hairline = dark ? colors.nightHairline : colors.hairline;
  const sheetBg = dark ? colors.sheetNight : colors.white;
  const myStop = corridor.stops[myStopIndex];
  const claimingVehicle = myPing?.claimedByVehicleId
    ? (vehicles.find((v) => v.id === myPing.claimedByVehicleId) ?? null)
    : null;
  const selectedVehicle = selectedVehicleId
    ? (vehicles.find((v) => v.id === selectedVehicleId) ?? null)
    : null;
  const selectedEta = selectedVehicle ? etaToStop(selectedVehicle, myStopIndex) : null;
  const stampDate = new Date(nowMs);
  const stamp = `${String(stampDate.getHours()).padStart(2, '0')}:${String(
    stampDate.getMinutes(),
  ).padStart(2, '0')}`;
  const noticeStop = expiredNotice
    ? corridorById(expiredNotice.corridorId).stops[expiredNotice.stopIndex]
    : null;

  // Sheet ETA headline: lead approaching vehicle, always "~" + stops/km.
  const lead = approaching[0] ?? null;
  const leadStopsAway = lead
    ? Math.ceil(Math.abs(myStopIndex - vehiclePosition(lead.vehicle)))
    : null;
  const leadKmAway = lead
    ? Number(Math.abs(myStop.km - vehicleKm(lead.vehicle, corridor.stops)).toFixed(1))
    : null;
  const leadEnd = lead
    ? lead.vehicle.direction === 'UP'
      ? corridor.to
      : corridor.from
    : null;

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: mode === 'driver' ? colors.night : canvas }]}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.headerZone, { backgroundColor: mode === 'driver' ? colors.night : canvas }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: dark ? colors.nightText : colors.ink }]}>
            Swat Raah
          </Text>
          <View
            style={[
              styles.liveBadge,
              {
                backgroundColor: dark ? colors.nightCard : colors.white,
                borderColor: hairline,
              },
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
        <MapHeader
          corridorId={corridorId}
          corridorLabel={`Mingora – ${corridor.to}`}
          destination={direction === 'UP' ? corridor.to : corridor.from}
          mode={mode}
          onModeChange={handleMode}
          onCorridorChange={handleCorridor}
          dark={dark}
          onDarkChange={setNightOverride}
        />
      </View>

      {mode === 'passenger' ? (
        <>
          <View style={styles.mapZone}>
            <RouteMap
              corridor={corridor}
              vehicles={vehicles}
              pings={pings}
              alerts={alerts}
              myStopIndex={myStopIndex}
              selectedStopIndex={myStopIndex}
              onSelectStop={handleStopTap}
              myVehicleId={null}
              leadVehicleId={lead?.vehicle.id ?? null}
              etaForLead={lead?.etaMinutes ?? null}
              dark={dark}
              orientation="vertical"
              interactive
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={handleVehicleTap}
            />
          </View>

          <View
            style={[
              styles.sheet,
              { backgroundColor: sheetBg, borderTopColor: hairline },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={sheetExpanded ? 'Hide sheet details' : 'Show sheet details'}
              onPress={() => { hapticTick(); setSheetExpanded((v) => !v); }}
              style={styles.sheetToggle}
            >
              <View style={[styles.grabber, { backgroundColor: hairline }]} />
              <View style={styles.etaRow}>
                <View style={styles.etaText}>
                  <View style={styles.liveRow}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.liveRowText, { color: secondary }]}>
                      LIVE · Updated {stamp}
                    </Text>
                  </View>
                  <Text style={[styles.etaTitle, { color: ink }]}>
                    {lead
                      ? lead.etaMinutes === 0
                        ? 'Arriving now'
                        : `Arrives in ~${lead.etaMinutes} min`
                      : 'No vehicle on the way yet'}
                  </Text>
                  <Text style={[styles.etaSub, { color: secondary }]}>
                    {lead && leadStopsAway !== null && leadKmAway !== null && leadEnd
                      ? `${leadStopsAway} stop${leadStopsAway === 1 ? '' : 's'} · ${leadKmAway} km away · Towards ${leadEnd}`
                      : 'Raise your hand so drivers ahead can see you.'}
                  </Text>
                </View>
                {sheetExpanded ? (
                  <ChevronDown size={24} color={secondary} />
                ) : (
                  <ChevronUp size={24} color={secondary} />
                )}
              </View>
            </Pressable>
            {sheetExpanded ? (
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
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
              {selectedVehicle ? (
                <View style={styles.selectedCard}>
                  <VehicleCard
                    vehicle={selectedVehicle}
                    etaMinutes={selectedEta}
                    farePerStop={corridor.farePerStop}
                    dark={dark}
                  />
                  {selectedEta === null ? (
                    <Text style={[styles.movingAway, { color: secondary }]}>
                      Moving away from {myStop.name} — it turns around at the terminus and comes
                      back.
                    </Text>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close vehicle details"
                    onPress={() => setSelectedVehicleId(null)}
                    style={({ pressed }) => [styles.closeRow, pressed && styles.pressed]}
                  >
                    <Text style={[styles.closeText, { color: secondary }]}>Close details</Text>
                  </Pressable>
                </View>
              ) : null}
              {!myPing ? (
                <SeatPicker
                  seatCount={seatCount}
                  onSeatCount={setSeatCount}
                  needsFamilySeat={needsFamilySeat}
                  onFamilySeat={setNeedsFamilySeat}
                  dark={dark}
                />
              ) : null}
              <Text style={[styles.standing, { color: secondary }]}>
                Standing at: {myStop.name} ({myStop.km} km) · Tap any stop on the map to move.
              </Text>              <View style={styles.directionRow}>
                <Text style={[styles.directionLabel, { color: secondary }]}>Going toward:</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Going toward ${corridor.to}${direction === 'UP' ? ', selected' : ''}`}
                  accessibilityState={{ selected: direction === 'UP' }}
                  onPress={() => { hapticTick(); setDirection('UP'); }}
                  style={({ pressed }) => [
                    styles.directionPill,
                    { borderColor: hairline },
                    direction === 'UP' && styles.directionPillActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.directionText,
                      { color: direction === 'UP' ? colors.white : ink },
                    ]}
                  >
                    {corridor.to}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Going toward ${corridor.from}${direction === 'DOWN' ? ', selected' : ''}`}
                  accessibilityState={{ selected: direction === 'DOWN' }}
                  onPress={() => { hapticTick(); setDirection('DOWN'); }}
                  style={({ pressed }) => [
                    styles.directionPill,
                    { borderColor: hairline },
                    direction === 'DOWN' && styles.directionPillActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.directionText,
                      { color: direction === 'DOWN' ? colors.white : ink },
                    ]}
                  >
                    {corridor.from}
                  </Text>
                </Pressable>
              </View>
              {alerts.length > 0 ? (
                <View style={styles.alertsBlock}>
                  <Text style={[styles.alertsTitle, { color: ink }]}>Road alerts on this corridor</Text>
                  {alerts.map((a) => (
                    <Text key={a.id} style={styles.alertLine}>
                      {a.tag} at {corridor.stops[a.stopIndex].name} ·{' '}
                      {minutesLeft(a.expiresAt, nowMs)} min left
                    </Text>
                  ))}
                </View>
              ) : null}
              {approaching.length === 0 && !myPing ? (
                <View
                  style={[
                    styles.emptyCard,
                    { backgroundColor: dark ? colors.nightCard : colors.white, borderColor: hairline },
                  ]}
                >
                  <Text style={[styles.emptyTitle, { color: ink }]}>
                    No vehicles heading toward {myStop.name} yet
                  </Text>
                  <Text style={[styles.emptyBody, { color: secondary }]}>
                    Raise your hand so drivers ahead can see you. Use the bar below — pick your
                    seats, tap once, and you are on the radar.
                  </Text>
                </View>
              ) : null}
              <Text style={[styles.footnote, { color: secondary }]}>
                Schematic — stops spaced by kilometres, not to geographic scale. Simulated live
                data · No GPS, no maps, no backend. Demo fares: PKR {corridor.farePerStop} per stop
                (not a real tariff).
              </Text>
            </ScrollView>
            ) : null}
            <View style={[styles.barWrap, { paddingBottom: insets.bottom }]}>
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
                dark={dark}
                compact={!sheetExpanded}
              />
            </View>
          </View>
        </>
      ) : (
        <ScrollView
          style={styles.driverScroll}
          contentContainerStyle={styles.driverScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DriverCockpit />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerZone: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 6, gap: 6 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typeScale.display },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald },
  liveText: { ...typeScale.tiny },
  mapZone: { flex: 1 },
  sheet: {
    maxHeight: '55%',
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetToggle: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaText: { flex: 1, gap: 4 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveRowText: { ...typeScale.tiny },
  etaTitle: { ...typeScale.etaHeadline },
  etaSub: { ...typeScale.small },
  sheetScroll: { flexGrow: 0, flexShrink: 1 },
  sheetScrollContent: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  barWrap: { backgroundColor: 'transparent' },
  driverScroll: { flex: 1 },
  driverScrollContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
  standing: { ...typeScale.small },
  directionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  directionLabel: { ...typeScale.smallBold },
  directionPill: {
    minHeight: touch.standard,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
  },
  directionPillActive: { backgroundColor: colors.emeraldAction, borderColor: colors.emeraldAction },
  directionText: { ...typeScale.smallBold },
  alertsBlock: { gap: 4 },
  alertsTitle: { ...typeScale.smallBold },
  alertLine: { ...typeScale.smallBold, color: colors.dangerLight },
  selectedCard: { gap: 8 },
  movingAway: { ...typeScale.small, paddingHorizontal: 4 },
  closeRow: { minHeight: touch.standard, alignItems: 'center', justifyContent: 'center' },
  closeText: { ...typeScale.smallBold },
  emptyCard: { borderWidth: 1, borderRadius: radius.card, padding: 24, gap: 8 },
  emptyTitle: { ...typeScale.title },
  emptyBody: { ...typeScale.body },
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
});
