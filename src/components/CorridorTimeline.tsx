import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Eye, Hand } from 'lucide-react-native';

import { minutesLeft } from '../store/useCorridorStore';
import { colors, radius, typeScale } from '../theme';
import type { Ping, RoadAlert, Stop, Vehicle } from '../types';
import { shortStopName } from './StopPills';

interface Props {
  stops: Stop[];
  vehicles: Vehicle[];
  pings: Ping[];
  alerts: RoadAlert[];
  myStopIndex: number;
  dark: boolean;
  /** Wall-clock ms (from the store tick) so expiry labels count down live. */
  nowMs: number;
  /** Driver name for a vehicle id, for "held by" chips. */
  driverNameFor: (vehicleId: string) => string | null;
}

export function CorridorTimeline({
  stops,
  vehicles,
  pings,
  alerts,
  myStopIndex,
  dark,
  nowMs,
  driverNameFor,
}: Props) {
  const text = dark ? colors.nightText : colors.ink;
  const secondary = dark ? colors.nightSecondary : colors.inkSecondary;
  const line = dark ? colors.nightHairline : colors.hairline;
  return (
    <View style={styles.wrap}>
      {stops.map((stop, i) => {
        const isMyStop = i === myStopIndex;
        const stopVehicles = vehicles.filter((v) => v.currentStopIndex === i);
        const stopPings = pings.filter((p) => p.stopIndex === i);
        const stopAlerts = alerts.filter((a) => a.stopIndex === i);
        const hasOpenPing = stopPings.some((p) => p.claimedByVehicleId === null);
        const isLast = i === stops.length - 1;
        return (
          <View key={stop.name} style={styles.row}>
            <View style={styles.track}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isMyStop
                      ? colors.emerald
                      : hasOpenPing
                        ? colors.amberBright
                        : dark
                          ? colors.nightCard
                          : colors.card,
                    borderColor: isMyStop || hasOpenPing ? 'transparent' : line,
                  },
                ]}
              />
              {!isLast ? <View style={[styles.line, { backgroundColor: line }]} /> : null}
            </View>
            <View style={styles.body}>
              <View style={styles.stopHeader}>
                <Text style={[styles.stopName, { color: text }]}>
                  {stop.name}
                </Text>
                <Text style={[styles.km, { color: secondary }]}>{stop.km} km</Text>
              </View>
              {isMyStop ? (
                <Text
                  style={[
                    styles.youAreHere,
                    { color: dark ? colors.emeraldLight : colors.emeraldText },
                  ]}
                >
                  You are standing here · Sawari
                </Text>
              ) : null}
              {stopPings.map((ping) => {
                const holder = ping.claimedByVehicleId
                  ? driverNameFor(ping.claimedByVehicleId)
                  : null;
                return (
                  <View
                    key={ping.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: holder ? colors.emeraldTint : colors.amberTint,
                      },
                    ]}
                  >
                    {ping.source === 'hand' ? (
                      <Hand
                        size={14}
                        color={holder ? colors.emeraldText : colors.amberDeep}
                      />
                    ) : (
                      <Eye size={14} color={colors.amberDeep} />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        { color: holder ? colors.emeraldText : colors.amberText },
                      ]}
                    >
                      {ping.passengerCount} waiting
                      {ping.needsFamilySeat ? ' · Family' : ''}
                      {ping.source === 'spotted' ? ' · Spotted on road' : ''}
                      {holder ? ` · Held by ${holder}` : ''}
                      {` · ${minutesLeft(ping.expiresAt, nowMs)} min left`}
                    </Text>
                  </View>
                );
              })}
              {stopAlerts.map((alert) => (
                <View key={alert.id} style={[styles.chip, { backgroundColor: colors.dangerTint }]}>
                  <AlertTriangle size={14} color={colors.dangerText} />
                  <Text style={[styles.chipText, { color: colors.dangerText }]}>
                    {alert.tag} · {minutesLeft(alert.expiresAt, nowMs)} min left
                  </Text>
                </View>
              ))}
              {stopVehicles.map((v) => {
                const nextName =
                  v.progress > 0
                    ? stops[
                        Math.min(
                          stops.length - 1,
                          Math.max(0, v.currentStopIndex + (v.direction === 'UP' ? 1 : -1)),
                        )
                      ].name
                    : null;
                return (
                  <Text key={v.id} style={[styles.vehicleLine, { color: secondary }]}>
                    {v.isMine ? 'You · ' : ''}Ustad {v.driverName.replace(/^Ustad /, '')} ·{' '}
                    {v.vehicleType} · {v.availableSeats} seats
                    {v.progress > 0 && nextName ? ` · Leaving → ${shortStopName(nextName)}` : ' · At stop'}
                  </Text>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 4 },
  row: { flexDirection: 'row' },
  track: { width: 20, alignItems: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, marginTop: 4 },
  line: { width: 2, flex: 1, minHeight: 28 },
  body: { flex: 1, paddingLeft: 12, paddingBottom: 24, gap: 8 },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  stopName: { ...typeScale.smallBold, flex: 1 },
  km: { ...typeScale.tiny },
  youAreHere: { ...typeScale.tiny },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: radius.chip,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { ...typeScale.smallBold },
  vehicleLine: { ...typeScale.small },
});
