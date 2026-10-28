import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Bus,
  Check,
  CircleStop,
  Eye,
  MapPin,
  Mic,
  Navigation,
  TriangleAlert,
  User,
  Users,
} from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { OptionCard } from '../components/OptionCard';
import { SeatStepper } from '../components/SeatStepper';
import { SegmentedControl } from '../components/SegmentedControl';
import { Sheet } from '../components/Sheet';
import { TopBar } from '../components/TopBar';
import { corridorById } from '../data/seed';
import { success, tick } from '../lib/haptics';
import {
  getForwardRadar,
  selectMyVehicle,
  useCorridorStore,
} from '../store/useCorridorStore';
import { useProfileStore } from '../store/useProfileStore';
import { useUiStore } from '../store/useUiStore';
import type { AlertTag } from '../types';
import { colors, radius, typeScale } from '../theme';

type SpotTab = 'spot' | 'hazard';

const SPOT_OPTIONS = [
  {
    key: 'standing',
    label: '1–2 Passengers Standing',
    sub: 'Waiting on roadside edge',
    count: 2,
    family: false,
    icon: <User size={24} color={colors.primary} />,
  },
  {
    key: 'crowd',
    label: '3–5 Passengers (Crowd)',
    sub: 'Includes family with luggage',
    count: 4,
    family: true,
    badge: 'PINNED',
    icon: <Users size={24} color={colors.primary} />,
  },
  {
    key: 'full',
    label: 'Full Van Load (6+ Sawari)',
    sub: 'Urgent capacity needed',
    count: 6,
    family: false,
    icon: <Bus size={24} color={colors.primary} />,
  },
];

const HAZARDS: { label: string; tag: AlertTag }[] = [
  { label: 'Landslide / Rockfall', tag: 'Landslide/Block' },
  { label: 'Traffic Jam / Check', tag: 'Traffic Jam' },
  { label: 'Mechanic SOS', tag: 'Mechanic SOS' },
];

/** Screen 9 — Ustad live cockpit, with the spot sawari / road alert sheet (10). */
export function CockpitScreen() {
  const corridorId = useCorridorStore((s) => s.corridorId);
  const pings = useCorridorStore((s) => s.pings);
  const alerts = useCorridorStore((s) => s.alerts);
  const nowMs = useCorridorStore((s) => s.nowMs);
  const mine = useCorridorStore(selectMyVehicle);
  const adjustMySeats = useCorridorStore((s) => s.adjustMySeats);
  const toggleMyFamilySeat = useCorridorStore((s) => s.toggleMyFamilySeat);
  const advanceMyVehicle = useCorridorStore((s) => s.advanceMyVehicle);
  const claimPing = useCorridorStore((s) => s.claimPing);
  const releaseHold = useCorridorStore((s) => s.releaseHold);
  const spotSawari = useCorridorStore((s) => s.spotSawari);
  const addRoadAlert = useCorridorStore((s) => s.addRoadAlert);
  const setDriverLive = useProfileStore((s) => s.setDriverLive);
  const setSheetOpenUi = useUiStore((s) => s.setSheetOpen);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<SpotTab>('spot');
  const [spotKey, setSpotKey] = useState('crowd');
  const [note, setNote] = useState('');
  const [acknowledged, setAcknowledged] = useState<Set<number>>(new Set());
  const [voiceSeconds, setVoiceSeconds] = useState<number | null>(null);
  const [voiceReady, setVoiceReady] = useState(false);
  const voiceTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const corridor = corridorById(corridorId);
  const currentStop = corridor.stops[mine.currentStopIndex];
  const nextIndex = mine.direction === 'UP' ? mine.currentStopIndex + 1 : mine.currentStopIndex - 1;
  const nextStop = corridor.stops[nextIndex];
  const terminusIndex = mine.direction === 'UP' ? corridor.stops.length - 1 : 0;
  const terminus = corridor.stops[terminusIndex];

  const forward = useMemo(
    () => getForwardRadar(mine, pings, corridorId),
    [mine, pings, corridorId],
  );
  // The terminus gets its own return card below — never also an ahead row.
  const ahead = useMemo(
    () => forward.ahead.filter((s) => s.stopIndex !== terminusIndex),
    [forward, terminusIndex],
  );
  const returnPassengers = useMemo(
    () => forward.returnDemand.reduce((sum, p) => sum + p.passengerCount, 0),
    [forward],
  );

  const held = useMemo(
    () => pings.filter((p) => p.claimedByVehicleId === mine.id),
    [pings, mine.id],
  );
  const corridorAlerts = useMemo(
    () => alerts.filter((a) => a.corridorId === corridorId),
    [alerts, corridorId],
  );

  useEffect(() => {
    setSheetOpenUi(sheetOpen);
    return () => setSheetOpenUi(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetOpen]);

  const stopVoice = () => {
    if (voiceTimer.current) clearInterval(voiceTimer.current);
    voiceTimer.current = null;
    setVoiceSeconds(null);
  };

  const holdVoice = () => {
    setVoiceReady(false);
    setVoiceSeconds(10);
    if (voiceTimer.current) clearInterval(voiceTimer.current);
    voiceTimer.current = setInterval(() => {
      setVoiceSeconds((s) => {
        if (s === null) return null;
        if (s <= 1) {
          if (voiceTimer.current) clearInterval(voiceTimer.current);
          voiceTimer.current = null;
          setVoiceReady(true);
          return null;
        }
        return s - 1;
      });
    }, 1000);
  };

  const openSheet = (tab: SpotTab) => {
    setSheetTab(tab);
    setSheetOpen(true);
  };

  const reportedAgo = (createdAt: number): string => {
    const mins = Math.max(0, Math.floor((nowMs - createdAt) / 60000));
    return mins === 0 ? 'just now' : `${mins}m ago`;
  };

  return (
    <AppScreen scroll={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TopBar right={<Text style={styles.cockpitSub}>Ustad Live Cockpit</Text>} />

        <View style={styles.liveRow}>
          <Chip
            label={`LIVE ON TRIP: ${corridor.from} → ${corridor.to}`}
            variant="apricot"
            dot
          />
          <AppButton
            label="End Trip"
            variant="danger"
            compact
            leftIcon={<CircleStop size={16} color={colors.error} />}
            onPress={() => setDriverLive(false)}
          />
        </View>

        <Card>
          <View style={styles.passRow}>
            <Navigation size={22} color={colors.primary} />
            <View style={styles.passText}>
              <Text style={styles.passTitle}>Passing: {currentStop.name}</Text>
              <Text style={styles.passSub}>
                Next: {nextStop ? nextStop.name : 'Terminus'}
              </Text>
            </View>
          </View>
          <AppButton
            label="Advance to next stop"
            variant="secondary"
            compact
            onPress={() => {
              advanceMyVehicle();
              tick();
            }}
          />
        </Card>

        <Card>
          <View style={styles.seatsHeader}>
            <Text style={styles.seatsTitle}>EMPTY SEATS LEFT IN YOUR CAR</Text>
            <Chip label={mine.vehicleType} variant="grey" />
          </View>
          <SeatStepper
            value={mine.availableSeats}
            onChange={(n) => adjustMySeats(n - mine.availableSeats)}
            variant="stepper"
          />
          <View style={styles.broadcastRow}>
            <Chip label="Broadcasting Live" variant="apricot" dot />
          </View>
        </Card>

        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Ladies / Family Seat Available"
          accessibilityState={{ checked: mine.hasFamilySeat }}
          onPress={toggleMyFamilySeat}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Card tone={mine.hasFamilySeat ? 'low' : 'plain'}>
            <View style={styles.familyRow}>
              <Text style={styles.familyText}>
                Ladies / Family Seat Available: {mine.hasFamilySeat ? 'YES (ON)' : 'NO (OFF)'}
              </Text>
              {mine.hasFamilySeat ? <Check size={18} color={colors.success} /> : null}
            </View>
          </Card>
        </Pressable>

        {note ? <Text style={styles.note}>{note}</Text> : null}

        <View style={styles.radarHeader}>
          <Text style={styles.sectionTitle}>
            ◎ ROAD AHEAD RADAR — NEXT STOPS IN FRONT OF YOU
          </Text>
          <Text style={styles.refreshNote}>Live 15s refresh</Text>
        </View>
        {ahead.map((stop, i) => {
          const stopsAway = i + 1;
          const handPings = stop.pings.filter((p) => p.source === 'hand');
          const spottedPings = stop.pings.filter((p) => p.source === 'spotted');
          const waitingPassengers = stop.pings.reduce((sum, p) => sum + p.passengerCount, 0);
          const spottedPassengers = spottedPings.reduce((sum, p) => sum + p.passengerCount, 0);
          const needsFamily = stop.pings.some((p) => p.needsFamilySeat);
          const oldest = stop.pings.reduce(
            (min, p) => Math.min(min, p.createdAt),
            Number.POSITIVE_INFINITY,
          );
          const firstHand = handPings[0];
          const highDemand = waitingPassengers >= 2;
          const stopName = corridor.stops[stop.stopIndex].name;
          return (
            <Card key={stop.stopIndex}>
              <View style={styles.radarRow}>
                <View style={styles.radarText}>
                  <Text style={styles.radarStop}>
                    {highDemand ? stopName.toUpperCase() : stopName}
                  </Text>
                  <Text style={styles.radarMeta}>
                    ({stop.distanceKm.toFixed(0)} km ahead • ~{stopsAway * 4} mins)
                  </Text>
                </View>
                <Text style={styles.reported}>
                  {stop.pings.length > 0 ? `Reported ${reportedAgo(oldest)}` : ''}
                </Text>
              </View>
              <View style={styles.chipRow}>
                {highDemand ? <Chip label="HIGH DEMAND" variant="dark" /> : null}
                {handPings.length > 0 ? (
                  <Chip
                    label={`${waitingPassengers} Passenger${waitingPassengers === 1 ? '' : 's'} Waiting`}
                    variant="apricot"
                  />
                ) : null}
                {spottedPings.length > 0 ? (
                  <Chip
                    label={`${spottedPassengers} Passenger${spottedPassengers === 1 ? '' : 's'} spotted on road`}
                    variant="grey"
                  />
                ) : null}
                {needsFamily ? <Chip label="Needs Family Section" variant="indigo" /> : null}
                {spottedPings.length > 0 ? <Chip label="Auto-radar" variant="grey" /> : null}
              </View>
              {firstHand ? (
                <AppButton
                  label="I'M COMING — HOLD PASSENGERS"
                  onPress={() => {
                    if (claimPing(firstHand.id)) {
                      success();
                      setNote(
                        `You are coming for ${firstHand.passengerCount} passenger(s) at ${stopName}.`,
                      );
                    }
                  }}
                />
              ) : spottedPings.length > 0 ? (
                acknowledged.has(stop.stopIndex) ? (
                  <Text style={styles.acked}>Acknowledged ✓</Text>
                ) : (
                  <AppButton
                    label="Acknowledge (Will Pick)"
                    variant="secondary"
                    compact
                    onPress={() => {
                      setAcknowledged(new Set(acknowledged).add(stop.stopIndex));
                      tick();
                    }}
                  />
                )
              ) : null}
            </Card>
          );
        })}

        <Card>
          <Text style={styles.radarStop}>
            {terminus.name} Stand (Terminal •{' '}
            {Math.abs(terminus.km - currentStop.km).toFixed(0)} km)
          </Text>
          <Text style={styles.priorityReturn}>Priority Return</Text>
          <Text style={styles.radarMeta}>
            {returnPassengers} Return Passengers waiting for trip back to{' '}
            {mine.direction === 'UP' ? corridor.from : corridor.to}!
          </Text>
        </Card>

        {held.length > 0 ? (
          <Card tone="low">
            <Text style={styles.radarStop}>
              Holding {held.reduce((sum, p) => sum + p.passengerCount, 0)} seat(s) for{' '}
              {held.length} group(s)
            </Text>
            <AppButton
              label="Release holds"
              variant="ghost"
              compact
              onPress={() => {
                releaseHold();
                success();
                setNote('Holds released — seats are free again.');
              }}
            />
          </Card>
        ) : null}

        {corridorAlerts.length > 0 ? (
          <View style={styles.chipRow}>
            {corridorAlerts.map((a) => (
              <Chip
                key={a.id}
                label={`${a.tag} at ${corridor.stops[a.stopIndex]?.name ?? ''}`}
                variant="amber"
              />
            ))}
          </View>
        ) : null}

        <View style={styles.spotActions}>
          <View style={styles.spotHalf}>
            <AppButton
              label="Spot Sawari — Pin for convoy"
              variant="secondary"
              leftIcon={<MapPin size={18} color={colors.ink} />}
              onPress={() => openSheet('spot')}
            />
          </View>
          <View style={styles.spotHalf}>
            <AppButton
              label="10s Alert — Road/Traffic mic"
              variant="secondary"
              leftIcon={<Mic size={18} color={colors.ink} />}
              onPress={() => openSheet('hazard')}
            />
          </View>
        </View>
      </ScrollView>

      {sheetOpen ? (
        <Sheet
          kicker="● DRIVER ASSIST MODE"
          title="Quick Road Dispatch & Hazard Report"
          onClose={() => setSheetOpen(false)}
          footer={
            sheetTab === 'spot' ? (
              <>
                <AppButton
                  label="Broadcast Passenger Pin to Adda Radar →"
                  onPress={() => {
                    const opt = SPOT_OPTIONS.find((o) => o.key === spotKey) ?? SPOT_OPTIONS[1];
                    spotSawari(opt.count, opt.family);
                    success();
                    setNote('Passenger pin broadcast to Adda Radar.');
                    setSheetOpen(false);
                  }}
                />
                <Text style={styles.karma}>
                  Earns you Adda Community Karma &amp; priority return queue tokens.
                </Text>
              </>
            ) : undefined
          }
        >
          <SegmentedControl<SpotTab>
            accessibilityLabel="Assist mode"
            options={[
              {
                value: 'spot',
                label: 'Spot Sawari (Behind)',
                icon: <Eye size={16} color={colors.ink} />,
              },
              {
                value: 'hazard',
                label: 'Hazard & SOS',
                icon: <TriangleAlert size={16} color={colors.ink} />,
              },
            ]}
            value={sheetTab}
            onChange={setSheetTab}
          />
          <View style={styles.locRow}>
            <Chip
              label={`Near ${currentStop.name}`}
              variant="outline"
              icon={<MapPin size={14} color={colors.primaryDeep} />}
            />
            <Chip
              label={`Heading: Towards ${mine.direction === 'UP' ? corridor.to : corridor.from}`}
              variant="apricot"
              icon={<Navigation size={14} color={colors.primaryDeep} />}
            />
          </View>

          {sheetTab === 'spot' ? (
            <>
              <Text style={styles.sheetLabel}>How many passengers did you just pass?</Text>
              <Text style={styles.sheetSub}>
                One-touch alert broadcasts directly to drivers running 3–8 mins behind you.
              </Text>
              {SPOT_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.key}
                  icon={opt.icon}
                  title={opt.label}
                  sub={opt.sub}
                  badge={opt.badge}
                  badgeVariant="amber"
                  selected={spotKey === opt.key}
                  onPress={() => setSpotKey(opt.key)}
                />
              ))}
            </>
          ) : (
            <>
              <View style={styles.hazardHeader}>
                <Text style={styles.sheetLabel}>Road Hazard &amp; SOS Quick Actions</Text>
                <Text style={styles.optional}>Optional</Text>
              </View>
              {HAZARDS.map((h) => (
                <AppButton
                  key={h.tag}
                  label={h.label}
                  variant="secondary"
                  onPress={() => {
                    addRoadAlert(h.tag);
                    success();
                    setNote(`${h.label} broadcast to Adda Radar.`);
                    setSheetOpen(false);
                  }}
                />
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Hold to record a Pashto voice note, 10 seconds"
                onPressIn={holdVoice}
                onPressOut={stopVoice}
                style={({ pressed }) => [styles.micButton, pressed && styles.micPressed]}
              >
                <Mic size={22} color={colors.white} />
                <Text style={styles.micLabel}>
                  {voiceReady
                    ? 'Voice note ready'
                    : voiceSeconds !== null
                      ? `Recording… ${voiceSeconds}s — release to cancel`
                      : 'Hold for 10s Pashto Voice Note'}
                </Text>
              </Pressable>
              <Text style={styles.sheetSub}>Hands-free mountain safety recording</Text>
            </>
          )}
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: 12, paddingBottom: 24 },
  cockpitSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  liveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  passText: { flex: 1, gap: 2 },
  passTitle: { ...typeScale.labelLg, color: colors.ink },
  passSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  seatsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  seatsTitle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  broadcastRow: { flexDirection: 'row', justifyContent: 'center' },
  familyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  familyText: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  note: { ...typeScale.bodySm, color: colors.success, textAlign: 'center' },
  radarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 4 },
  sectionTitle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  refreshNote: { ...typeScale.labelSm, color: colors.muted },
  radarRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  radarText: { flex: 1, gap: 2 },
  radarStop: { ...typeScale.labelLg, color: colors.ink },
  radarMeta: { ...typeScale.bodySm, color: colors.inkSecondary },
  reported: { ...typeScale.labelSm, color: colors.muted },
  priorityReturn: { ...typeScale.labelMd, color: colors.primaryDeep },
  acked: { ...typeScale.labelLg, color: colors.success },
  spotActions: { flexDirection: 'row', gap: 8 },
  spotHalf: { flex: 1 },
  locRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetLabel: { ...typeScale.labelLg, color: colors.ink },
  sheetSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  karma: { ...typeScale.bodySm, color: colors.muted, textAlign: 'center' },
  hazardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  optional: { ...typeScale.labelMd, color: colors.muted },
  micButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
  },
  micPressed: { opacity: 0.7 },
  micLabel: { ...typeScale.labelLg, color: colors.white, textAlign: 'center', flex: 1 },
  pressed: { opacity: 0.65 },
});
