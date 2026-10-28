import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Armchair,
  ArrowDown,
  ArrowUp,
  Banknote,
  CarFront,
  Check,
  Clock,
  Hand,
  Handshake,
  Lock,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field } from '../components/Field';
import { SeatStepper } from '../components/SeatStepper';
import { SegmentedControl } from '../components/SegmentedControl';
import { Sheet } from '../components/Sheet';
import { StopRow, type StopState } from '../components/StopRow';
import { TopBar } from '../components/TopBar';
import { VehicleCard } from '../components/VehicleCard';
import { corridorById } from '../data/seed';
import { radarFarePerSeat } from '../data/faresDirectory';
import { success } from '../lib/haptics';
import { formatPlate } from '../lib/format';
import { shortStopName } from '../lib/stopNames';
import {
  etaToStop,
  getApproachingVehicles,
  minutesLeft,
  selectMyPing,
  selectMyStopIndex,
  useCorridorStore,
  vehiclePosition,
} from '../store/useCorridorStore';
import { useUiStore } from '../store/useUiStore';
import type { Corridor, Direction, Vehicle } from '../types';
import { colors, radius, typeScale } from '../theme';

function kmAtPosition(corridor: Corridor, v: Vehicle): number {
  const pos = vehiclePosition(v);
  const i = Math.max(0, Math.min(corridor.stops.length - 1, Math.floor(pos)));
  const frac = pos - i;
  const a = corridor.stops[i];
  const b = corridor.stops[Math.min(i + 1, corridor.stops.length - 1)];
  return a.km + frac * (b.km - a.km);
}

/** Picker stop states, direction-aware: origin = terminal, destination = terminus. */
function stopStateFor(index: number, draftStop: number, direction: Direction, last: number): StopState {
  const origin = direction === 'UP' ? 0 : last;
  const dest = direction === 'UP' ? last : 0;
  if (index === draftStop) return 'selected';
  if (index === origin) return 'terminal';
  if (index === dest) return 'terminus';
  if (direction === 'UP') {
    if (index < draftStop) return index === draftStop - 1 ? 'prev' : 'passed';
    if (index === draftStop + 1) return 'next';
    return 'waiting';
  }
  if (index > draftStop) return index === draftStop + 1 ? 'prev' : 'passed';
  if (index === draftStop - 1) return 'next';
  return 'waiting';
}

/** "Seats #1 & #2" / "#1" / "#1, #2 & #3" for the family banner. */
function seatList(n: number): string {
  const seats = Array.from({ length: n }, (_, i) => `#${i + 1}`);
  if (seats.length <= 1) return seats.join('');
  return `${seats.slice(0, -1).join(', ')} & ${seats[seats.length - 1]}`;
}

/** Screen 5 — Passenger live radar (timeline), with the stop picker (6) and locked ride (7). */
export function RadarPassengerScreen() {
  const corridorId = useCorridorStore((s) => s.corridorId);
  const direction = useCorridorStore((s) => s.direction);
  const myStopIndex = useCorridorStore(selectMyStopIndex);
  const vehicles = useCorridorStore((s) => s.vehicles);
  const pings = useCorridorStore((s) => s.pings);
  const seatCount = useCorridorStore((s) => s.seatCount);
  const needsFamilySeat = useCorridorStore((s) => s.needsFamilySeat);
  const myPing = useCorridorStore(selectMyPing);
  const expiredNotice = useCorridorStore((s) => s.expiredNotice);
  const completedTrip = useCorridorStore((s) => s.completedTrip);
  const nowMs = useCorridorStore((s) => s.nowMs);
  const setSeatCount = useCorridorStore((s) => s.setSeatCount);
  const setNeedsFamilySeat = useCorridorStore((s) => s.setNeedsFamilySeat);
  const setDirection = useCorridorStore((s) => s.setDirection);
  const setMyStop = useCorridorStore((s) => s.setMyStop);
  const raiseHand = useCorridorStore((s) => s.raiseHand);
  const cancelHand = useCorridorStore((s) => s.cancelHand);
  const completeTrip = useCorridorStore((s) => s.completeTrip);
  const dismissCompletedTrip = useCorridorStore((s) => s.dismissCompletedTrip);
  const dismissExpiredNotice = useCorridorStore((s) => s.dismissExpiredNotice);
  const raiseAgainFromNotice = useCorridorStore((s) => s.raiseAgainFromNotice);
  const setSheetOpen = useUiStore((s) => s.setSheetOpen);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftDirection, setDraftDirection] = useState<Direction>(direction);
  const [draftStop, setDraftStop] = useState(myStopIndex);
  const [search, setSearch] = useState('');

  const corridor = corridorById(corridorId);
  const myStop = corridor.stops[myStopIndex];

  // Nearest first (smallest distance to my stop).
  const approaching = useMemo(() => {
    const list = getApproachingVehicles(vehicles, corridorId, myStopIndex);
    const mapped = list.map(({ vehicle, etaMinutes }) => ({
      vehicle,
      etaMinutes,
      distanceKm: Math.abs(kmAtPosition(corridor, vehicle) - myStop.km),
    }));
    mapped.sort((a, b) => a.distanceKm - b.distanceKm);
    return mapped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, corridorId, myStopIndex]);

  const claimedVehicle = myPing?.claimedByVehicleId
    ? vehicles.find((v) => v.id === myPing.claimedByVehicleId)
    : undefined;

  const openPicker = () => {
    setDraftDirection(direction);
    setDraftStop(myStopIndex);
    setSearch('');
    setPickerOpen(true);
  };

  useEffect(() => {
    setSheetOpen(pickerOpen);
    return () => setSheetOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  // Live picker metas, derived in useMemo from raw arrays (stability guard).
  const pickerMeta = useMemo(() => {
    const waiting = new Map<number, number>();
    const terminusIndex = draftDirection === 'UP' ? corridor.stops.length - 1 : 0;
    let returnPassengers = 0;
    for (const p of pings) {
      if (p.corridorId !== corridorId || p.claimedByVehicleId !== null) continue;
      waiting.set(p.stopIndex, (waiting.get(p.stopIndex) ?? 0) + 1);
      if (p.direction !== draftDirection && p.stopIndex === terminusIndex) {
        returnPassengers += p.passengerCount;
      }
    }
    const carsAtAdda = vehicles.filter(
      (v) => v.corridorId === corridorId && v.currentStopIndex === 0,
    ).length;
    const approachingDraft = getApproachingVehicles(vehicles, corridorId, draftStop).length;
    return { waiting, returnPassengers, carsAtAdda, approachingDraft };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pings, vehicles, corridorId, draftStop, draftDirection]);

  const radarBody = (
    <>
      <TopBar right={<Chip label="● LIVE RADAR" variant="apricot" />} />

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.corridorTitle}>
            {corridor.from} → {corridor.to} Corridor
          </Text>
          <Chip label="Active" variant="green" dot />
        </View>
        <View style={styles.stopRow}>
          <MapPin size={18} color={colors.primary} />
          <Text style={styles.stopText}>
            <Text style={styles.stopLabel}>My Stop: </Text>
            {myStop.name}
          </Text>
          <AppButton label="Change" variant="secondary" compact onPress={openPicker} />
        </View>
      </Card>

      {expiredNotice ? (
        <Card tone="low">
          <Text style={styles.bannerTitle}>Your hand expired</Text>
          <Text style={styles.bannerText}>
            Your raised hand at{' '}
            {corridorById(expiredNotice.corridorId).stops[expiredNotice.stopIndex].name}{' '}
            expired. Raise again to hold seats.
          </Text>
          <View style={styles.bannerActions}>
            <AppButton
              label="Raise again"
              compact
              onPress={() => {
                raiseAgainFromNotice();
                success();
              }}
            />
            <AppButton label="Dismiss" variant="ghost" compact onPress={dismissExpiredNotice} />
          </View>
        </Card>
      ) : null}

      {completedTrip ? (
        <Card tone="low">
          <Text style={styles.bannerTitle}>Trip complete — thank you!</Text>
          <Text style={styles.bannerText}>
            You travelled with {completedTrip.driverName} ({completedTrip.vehicleType}{' '}
            {completedTrip.plateNumber}) for {completedTrip.passengerCount} seat(s). Safe
            travels!
          </Text>
          <AppButton label="Done" variant="ghost" compact onPress={dismissCompletedTrip} />
        </Card>
      ) : null}

      <View style={styles.approachingHeader}>
        <Text style={styles.approachingTitle}>APPROACHING VEHICLES</Text>
        <View style={styles.approachingChips}>
          <Chip label={`${approaching.length} IN RANGE`} variant="apricot" />
          <Chip
            label="Auto-refresh 5s"
            variant="grey"
            icon={<RefreshCw size={12} color={colors.muted} />}
          />
        </View>
      </View>

      {approaching.length === 0 ? (
        <Text style={styles.empty}>No vehicles approaching your stop right now.</Text>
      ) : (
        approaching.map(({ vehicle, etaMinutes, distanceKm }, i) => (
          <View key={vehicle.id} style={styles.timelineItem}>
            <View style={styles.dotCol}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.timelineBody}>
              <View style={styles.nodeRow}>
                <Text style={styles.nodeText}>
                  {corridor.stops[vehicle.currentStopIndex].name} • {distanceKm.toFixed(1)} km
                </Text>
                {distanceKm < 1 ? (
                  <Chip label="CLOSING FAST" variant="red" />
                ) : (
                  <Text style={styles.stageStop}>Stage Stop</Text>
                )}
              </View>
              <VehicleCard
                vehicle={vehicle}
                etaMinutes={etaMinutes}
                farePerSeat={radarFarePerSeat(vehicle.vehicleType, corridor.farePerStop)}
                addaName={corridor.from}
              />
            </View>
          </View>
        ))
      )}

      <View style={styles.timelineItem}>
        <View style={styles.dotCol}>
          <View style={styles.youDot}>
            <MapPin size={12} color={colors.white} />
          </View>
        </View>
        <View style={styles.timelineBody}>
          <Text style={styles.youTitle}>YOU ({myStop.name} Waiting Spot)</Text>
          <Text style={styles.youSub}>Pickup Node</Text>
        </View>
      </View>
    </>
  );

  return (
    <AppScreen scroll={false}>
      {claimedVehicle && myPing ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <LockedView
            corridor={corridor}
            myStopIndex={myStopIndex}
            ping={myPing}
            vehicle={claimedVehicle}
            onCancel={() => {
              cancelHand();
              success();
            }}
            onComplete={() => {
              completeTrip();
              success();
            }}
          />
        </ScrollView>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {radarBody}
          </ScrollView>
          <View style={styles.bottomBar}>
            {myPing ? (
              <Card tone="low">
                <Text style={styles.bannerTitle}>Hand raised at {myStop.name}</Text>
                <Text style={styles.bannerText}>
                  {myPing.passengerCount} seat(s) requested
                  {myPing.needsFamilySeat ? ' • Family seating' : ''} • Hold expires in{' '}
                  {minutesLeft(myPing.expiresAt, nowMs)} min. Waiting for a driver to accept.
                </Text>
                <AppButton
                  label="Cancel hand"
                  variant="ghost"
                  compact
                  onPress={() => {
                    cancelHand();
                    success();
                  }}
                />
              </Card>
            ) : (
              <>
                <View style={styles.reserveRow}>
                  <Text style={styles.reserveLabel}>Reserve Seats:</Text>
                  <View style={styles.reserveStepper}>
                    <SeatStepper
                      value={seatCount}
                      onChange={(n) => setSeatCount(n as 1 | 2 | 3)}
                      variant="segmented"
                    />
                  </View>
                </View>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityLabel="Need Ladies / Family Section"
                  accessibilityState={{ checked: needsFamilySeat }}
                  onPress={() => setNeedsFamilySeat(!needsFamilySeat)}
                  style={[
                    styles.familyRow,
                    needsFamilySeat && styles.familyRowOn,
                  ]}
                >
                  <ShieldCheck size={18} color={colors.family} />
                  <Text style={styles.familyLabel}>Need Ladies / Family Section:</Text>
                  <Chip
                    label={needsFamilySeat ? 'ACTIVE' : 'Off'}
                    variant={needsFamilySeat ? 'indigo' : 'grey'}
                  />
                </Pressable>
                <AppButton
                  label={`Raise Hand at ${myStop.name} (Hold ${seatCount} Seats)`}
                  leftIcon={<Hand size={20} color={colors.white} />}
                  onPress={() => {
                    raiseHand();
                    success();
                  }}
                />
              </>
            )}
          </View>
        </>
      )}

      {pickerOpen ? (
        <Sheet
          title="Select Route Stop & Direction"
          subtitle={`${corridor.from} ↔ ${corridor.to} Corridor`}
          onClose={() => setPickerOpen(false)}
          footer={
            <>
              <View style={styles.footerPill}>
                <MapPin size={16} color={colors.primaryDeep} />
                <Text style={styles.footerSelected}>
                  Selected: {corridor.stops[draftStop].name} (Dir:{' '}
                  {draftDirection === 'UP' ? corridor.to : corridor.from})
                </Text>
                {shortStopName(corridor.stops[draftStop].name) === 'Kabal' ? (
                  <Chip label="Zone 2" variant="amber" />
                ) : null}
              </View>
              <AppButton
                label="Confirm My Stop →"
                onPress={() => {
                  setDirection(draftDirection);
                  setMyStop(draftStop);
                  setPickerOpen(false);
                  success();
                }}
              />
            </>
          }
        >
          <SegmentedControl<Direction>
            accessibilityLabel="Direction"
            options={[
              {
                value: 'UP',
                label: `Heading UP (${corridor.to})`,
                icon: <ArrowUp size={16} color={colors.ink} />,
              },
              {
                value: 'DOWN',
                label: `Heading DOWN (${corridor.from})`,
                icon: <ArrowDown size={16} color={colors.ink} />,
              },
            ]}
            value={draftDirection}
            onChange={setDraftDirection}
          />
          <Field
            label="Search stop"
            labelHidden
            value={search}
            onChangeText={setSearch}
            placeholder="Search stop along corridor…"
            prefix={<Search size={18} color={colors.muted} />}
            suffix={<Mic size={18} color={colors.muted} />}
            accessibilityLabel="Search stop along corridor"
          />
          <View style={styles.stopList}>
            {corridor.stops
              .map((stop, i) => ({ stop, i }))
              .filter(({ stop }) =>
                stop.name.toLowerCase().includes(search.trim().toLowerCase()),
              )
              .map(({ stop, i }) => {
                const state = stopStateFor(i, draftStop, draftDirection, corridor.stops.length - 1);
                const waiting = pickerMeta.waiting.get(i) ?? 0;
                let meta: string | undefined;
                if (state === 'terminal') {
                  meta = `${pickerMeta.carsAtAdda} Cars Waiting at Adda`;
                } else if (state === 'selected') {
                  meta = `${pickerMeta.approachingDraft} Approaching`;
                } else if (state === 'terminus') {
                  meta = `${pickerMeta.returnPassengers} Return Passengers`;
                } else if (waiting > 0) {
                  meta = `${waiting} Passenger${waiting > 1 ? 's' : ''} Waiting`;
                }
                return (
                  <StopRow
                    key={stop.name}
                    name={stop.name}
                    state={state}
                    meta={meta}
                    hotspot={state === 'selected' && pickerMeta.approachingDraft >= 2}
                    last={i === corridor.stops.length - 1}
                    onPress={() => setDraftStop(i)}
                  />
                );
              })}
          </View>
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

function LockedView({
  corridor,
  myStopIndex,
  ping,
  vehicle,
  onCancel,
  onComplete,
}: {
  corridor: Corridor;
  myStopIndex: number;
  ping: NonNullable<ReturnType<typeof selectMyPing>>;
  vehicle: Vehicle;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const myStop = corridor.stops[myStopIndex];
  const eta = etaToStop(vehicle, myStopIndex);
  const fare = radarFarePerSeat(vehicle.vehicleType, corridor.farePerStop);
  const total = fare * ping.passengerCount;
  const standName = myStop.name.endsWith('Stand') ? myStop.name : `${myStop.name} Stand`;
  const isMatta = corridor.id === 'mingora_matta';

  // Horizontal timeline: [prev stop, if any] — [driver's stop] — [my stop].
  const prevIndex =
    vehicle.direction === 'UP'
      ? vehicle.currentStopIndex - 1
      : vehicle.currentStopIndex + 1;
  const prevStop =
    prevIndex >= 0 && prevIndex < corridor.stops.length ? corridor.stops[prevIndex] : null;

  return (
    <>
      <TopBar
        right={
          <Chip label={`${shortStopName(myStop.name)} Corridor`} variant="apricot" />
        }
      />

      <Card>
        <View style={styles.lockHeader}>
          <View style={styles.lockTile}>
            <Lock size={20} color={colors.white} />
          </View>
          <View style={styles.lockHeaderText}>
            <Chip
              label="RIDE LOCKED & CONFIRMED"
              variant="apricot"
              icon={<Check size={14} color={colors.primaryDeep} />}
            />
            <Text style={styles.lockedTitle}>
              {vehicle.driverName} is Holding {ping.passengerCount} Seats for You!
            </Text>
          </View>
        </View>
        <View style={styles.handshakeRow}>
          <Handshake size={16} color={colors.primaryDeep} />
          <Text style={styles.handshakeText}>
            Handshake established on {corridor.from}–{corridor.to}
            {isMatta ? ' Route #4' : ' Route'}
          </Text>
        </View>
      </Card>

      <Card>
        <View style={styles.hTimeline}>
          <View style={styles.hLine} />
          {prevStop ? (
            <View style={styles.hNode}>
              <View style={styles.hNodePassed}>
                <Check size={14} color={colors.muted} />
              </View>
              <Text style={styles.hNodeName}>{prevStop.name}</Text>
              <Text style={styles.hNodeLabel}>Passed</Text>
            </View>
          ) : null}
          <View style={styles.hNode}>
            <View style={styles.hNodeDriver}>
              <CarFront size={14} color={colors.white} />
            </View>
            <Text style={styles.hNodeName}>{corridor.stops[vehicle.currentStopIndex].name}</Text>
            <Text style={styles.hNodeLabel}>Driver Here</Text>
          </View>
          <View style={styles.hNode}>
            <View style={styles.hNodeYou}>
              <MapPin size={14} color={colors.white} />
            </View>
            <Text style={styles.hNodeName}>{myStop.name}</Text>
            <Text style={styles.hNodeLabel}>(You)</Text>
          </View>
        </View>
      </Card>

      <Card tone="apricot">
        <View style={styles.arrivingRow}>
          <View style={styles.clockTile}>
            <Clock size={20} color={colors.primaryDeep} />
          </View>
          <View style={styles.arrivingText}>
            <Text style={styles.arrivingMain}>
              {eta === null
                ? 'Driver is on the way'
                : eta === 0
                  ? 'Arriving now'
                  : `Arriving in ~${eta} Mins`}
              {eta !== null && eta > 0 ? (
                <Text style={styles.arrivingDot}> ●</Text>
              ) : null}
            </Text>
            <Text style={styles.arrivingSub}>
              Please wait at {standName} (Do not leave)
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.driverRow}>
          <View style={styles.driverTileWrap}>
            <View style={styles.driverTile}>
              <CarFront size={22} color={colors.primary} />
            </View>
            {vehicle.verifiedAdda ? (
              <View style={styles.driverBadge}>
                <Check size={10} color={colors.white} />
              </View>
            ) : null}
          </View>
          <View style={styles.driverText}>
            <View style={styles.driverNameRow}>
              <Text style={styles.driverName}>{vehicle.driverName}</Text>
              <View style={styles.driverPlate}>
                <Text style={styles.driverPlateText}>
                  KPK {formatPlate(vehicle.plateNumber)}
                </Text>
              </View>
            </View>
            <Text style={styles.driverVerifiedRow}>
              {vehicle.verifiedAdda ? (
                <Text style={styles.driverVerified}>Verified Adda Member</Text>
              ) : null}
              {vehicle.verifiedAdda ? <Text style={styles.driverDot}> • </Text> : null}
              <Text style={styles.driverRating}>★ {vehicle.rating.toFixed(1)}</Text>
            </Text>
            <Text style={styles.driverMember}>
              {corridor.from} Adda Member • {vehicle.tripsCompleted}+ Corridor Trips
            </Text>
          </View>
        </View>
        <View style={styles.driverDivider} />
        <View style={styles.boxesRow}>
          <View style={styles.box}>
            <Text style={styles.boxLabel}>VEHICLE</Text>
            <View style={styles.boxValueRow}>
              <CarFront size={16} color={colors.primaryDeep} />
              <Text style={styles.boxValue}>{vehicle.vehicleType} (White)</Text>
            </View>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxLabel}>SEAT HOLD</Text>
            <View style={styles.boxValueRow}>
              <Armchair size={16} color={colors.primaryDeep} />
              <Text style={styles.boxValue}>{ping.passengerCount} Seats (Front Row)</Text>
            </View>
          </View>
        </View>
        <View style={styles.fareBox}>
          <Banknote size={20} color={colors.primaryDeep} />
          <View style={styles.fareBoxText}>
            <Text style={styles.boxLabel}>TOTAL FARE (CASH)</Text>
            <Text style={styles.boxValue}>Rs. {total} total</Text>
          </View>
          <Chip label={`Rs. ${fare} × ${ping.passengerCount} seats`} variant="apricot" />
        </View>
      </Card>

      {ping.needsFamilySeat ? (
        <Card tone="family">
          <View style={styles.familyBannerTitleRow}>
            <Text style={styles.familyBannerTitle}>FRONT FAMILY/LADIES ROW</Text>
            <Chip label="EXCLUSIVE" variant="indigo" small />
          </View>
          <Text style={styles.familyBannerText}>
            Seats {seatList(ping.passengerCount)} held exclusively for your party. Driver cannot
            reallocate during transit.
          </Text>
        </Card>
      ) : null}

      <View style={styles.lockedActions}>
        <View style={styles.lockedActionHalf}>
          <AppButton
            label="Call Ustad Gul"
            variant="secondary"
            leftIcon={<Phone size={18} color={colors.ink} />}
            onPress={() => undefined}
          />
        </View>
        <View style={styles.lockedActionHalf}>
          <AppButton
            label="WhatsApp Location / Message"
            variant="secondary"
            leftIcon={<MessageCircle size={18} color={colors.ink} />}
            onPress={() => undefined}
          />
        </View>
      </View>
      <AppButton
        label="Cancel Hold (Releases seats back to radar)"
        variant="ghost"
        onPress={onCancel}
      />
      <AppButton label="Mark Trip Complete" variant="family" onPress={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 12, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  corridorTitle: { ...typeScale.headlineSm, color: colors.ink, flex: 1 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stopText: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  stopLabel: { color: colors.inkSecondary },
  bannerTitle: { ...typeScale.headlineSm, color: colors.ink },
  bannerText: { ...typeScale.bodySm, color: colors.inkSecondary },
  bannerActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  approachingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 4 },
  approachingTitle: { ...typeScale.labelLg, color: colors.ink },
  approachingChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  empty: { ...typeScale.body, color: colors.inkSecondary },
  timelineItem: { flexDirection: 'row', gap: 12 },
  dotCol: { alignItems: 'center', width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginTop: 4 },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.cardBorder, minHeight: 12 },
  timelineBody: { flex: 1, gap: 8 },
  nodeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  nodeText: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  stageStop: { ...typeScale.labelMd, color: colors.primaryDeep },
  youDot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  youTitle: { ...typeScale.labelLg, color: colors.ink },
  youSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  bottomBar: { gap: 12, paddingTop: 12 },
  reserveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reserveLabel: { ...typeScale.labelLg, color: colors.ink },
  reserveStepper: { flex: 1 },
  familyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 56,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
  },
  familyRowOn: { backgroundColor: colors.familyTint, borderColor: colors.family },
  familyLabel: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stopList: { gap: 0 },
  footerSelected: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  lockHeader: { flexDirection: 'row', gap: 12 },
  lockTile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.micro,
  },
  lockHeaderText: { flex: 1, gap: 8 },
  lockedTitle: { ...typeScale.headlineSm, color: colors.ink },
  handshakeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
  handshakeText: { ...typeScale.bodySm, color: colors.inkSecondary, flex: 1 },
  hTimeline: { flexDirection: 'row', position: 'relative', paddingTop: 8 },
  hLine: {
    position: 'absolute',
    top: 28,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: colors.cardBorder,
  },
  hNode: { flex: 1, alignItems: 'center', gap: 4 },
  hNodePassed: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: 20,
  },
  hNodeDriver: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  hNodeYou: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.family,
    borderRadius: 20,
  },
  hNodeName: { ...typeScale.labelMd, color: colors.ink, textAlign: 'center' },
  hNodeLabel: { ...typeScale.labelSm, color: colors.muted, textAlign: 'center' },
  arrivingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clockTile: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.apricot,
    borderRadius: radius.micro,
  },
  arrivingText: { flex: 1, gap: 2 },
  arrivingMain: { ...typeScale.labelLg, color: colors.ink },
  arrivingDot: { color: colors.primary },
  arrivingSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverTileWrap: { position: 'relative' },
  driverTile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.micro,
  },
  driverBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.card,
  },
  driverText: { flex: 1, gap: 4 },
  driverNameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  driverName: { ...typeScale.headlineSm, color: colors.ink },
  driverPlate: {
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  driverPlateText: { ...typeScale.labelMd, color: colors.white, letterSpacing: 0.5 },
  driverVerifiedRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  driverVerified: { ...typeScale.labelMd, color: colors.primaryDeep },
  driverDot: { ...typeScale.labelMd, color: colors.muted },
  driverRating: { ...typeScale.labelMd, color: colors.ink },
  driverMember: { ...typeScale.labelSm, color: colors.muted },
  driverDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 12,
  },
  boxesRow: { flexDirection: 'row', gap: 12 },
  box: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: 12,
    gap: 6,
  },
  boxLabel: { ...typeScale.labelSm, color: colors.muted },
  boxValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  boxValue: { ...typeScale.labelLg, color: colors.ink, flexShrink: 1 },
  fareBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: 12,
    marginTop: 12,
  },
  fareBoxText: { flex: 1, gap: 2 },
  familyBannerTitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  familyBannerTitle: { ...typeScale.labelLg, color: colors.family },
  familyBannerText: { ...typeScale.bodySm, color: colors.inkSecondary, marginTop: 6 },
  lockedActions: { flexDirection: 'row', gap: 8 },
  lockedActionHalf: { flex: 1 },
});
