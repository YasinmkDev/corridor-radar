import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Hand, X } from 'lucide-react-native';

import { etaToStop, minutesLeft, useCorridorStore } from '../store/useCorridorStore';
import { colors, radius, touch, typeScale } from '../theme';
import type { Ping, Vehicle } from '../types';

interface Props {
  stopName: string;
  seatCount: 1 | 2 | 3;
  onSeatCount: (n: 1 | 2 | 3) => void;
  needsFamilySeat: boolean;
  onFamilySeat: (v: boolean) => void;
  myPing: Ping | null;
  claimingVehicle: Vehicle | null;
  onRaiseHand: () => void;
  onCancelHand: () => void;
}

export function PassengerBar({
  stopName,
  seatCount,
  onSeatCount,
  needsFamilySeat,
  onFamilySeat,
  myPing,
  claimingVehicle,
  onRaiseHand,
  onCancelHand,
}: Props) {
  const nowMs = useCorridorStore((s) => s.nowMs);

  if (myPing && claimingVehicle) {
    const eta = etaToStop(claimingVehicle, myPing.stopIndex);
    return (
      <View style={[styles.sheet, styles.lockedSheet]}>
        <Text style={[styles.lockedTitle, { color: colors.emerald }]}>
          Ride Locked! · Sawari Pakki
        </Text>
        <Text style={styles.lockedBody}>
          Ustad {claimingVehicle.driverName.replace(/^Ustad /, '')} ({claimingVehicle.vehicleType})
          is holding {myPing.passengerCount} seat{myPing.passengerCount > 1 ? 's' : ''} for you
          {eta === null ? ' — on the way' : eta === 0 ? ' — arriving now' : ` — arriving in ~${eta} mins`}
        </Text>
        <Text style={styles.lockedMeta}>
          Plate {claimingVehicle.plateNumber}
          {claimingVehicle.verifiedAdda ? ' · Verified Adda' : ''} · {stopName}
        </Text>
        <Pressable accessibilityRole="button" onPress={onCancelHand} style={styles.cancelRow}>
          <X size={16} color={colors.inkSecondary} />
          <Text style={styles.cancelText}>Cancel hold</Text>
        </Pressable>
      </View>
    );
  }

  if (myPing) {
    return (
      <View style={[styles.sheet, styles.radarSheet]}>
        <View style={styles.radarHeader}>
          <Text style={[styles.radarTitle, { color: colors.amber }]}>Radar active · Hath Uthao</Text>
          <Text style={[styles.radarMeta, { color: colors.inkSecondary }]}>
            Expires in {minutesLeft(myPing.expiresAt, nowMs)} min
          </Text>
        </View>
        <Text style={styles.radarBody}>
          Drivers ahead can see you at {stopName}: {myPing.passengerCount} seat
          {myPing.passengerCount > 1 ? 's' : ''}
          {myPing.needsFamilySeat ? ' · Family / Ladies Seat needed' : ''}. Waiting for an Ustad to
          hold your seats.
        </Text>
        <Pressable accessibilityRole="button" onPress={onCancelHand} style={styles.cancelRow}>
          <X size={16} color={colors.inkSecondary} />
          <Text style={styles.cancelText}>Lower hand</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.sheet}>
      <Text style={styles.label}>How many seats? · Kitni Sawari?</Text>
      <View style={styles.row}>
        {([1, 2, 3] as const).map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            onPress={() => onSeatCount(n)}
            style={[styles.seatPill, seatCount === n && styles.seatPillActive]}
          >
            <Text style={[styles.seatText, seatCount === n && styles.seatTextActive]}>
              {n === 3 ? '3+' : `${n}`}
            </Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => onFamilySeat(!needsFamilySeat)}
          style={[styles.familyPill, needsFamilySeat && styles.familyPillActive]}
        >
          <Text
            style={[styles.familyText, needsFamilySeat && styles.familyTextActive]}
          >
            Family / Ladies Seat
          </Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onRaiseHand}
        style={styles.raiseButton}
      >
        <Hand size={22} color="#FFFFFF" />
        <Text style={styles.raiseText}>Raise Hand at {stopName}</Text>
      </Pressable>
      <Text style={styles.hint}>Hath Uthao · No typing needed. Drivers ahead will see you.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
  },
  label: { ...typeScale.smallBold, color: colors.ink },
  row: { flexDirection: 'row', gap: 8 },
  seatPill: {
    minHeight: touch.standard,
    minWidth: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 16,
  },
  seatPillActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  seatText: { ...typeScale.bodyBold, color: colors.ink },
  seatTextActive: { color: '#FFFFFF' },
  familyPill: {
    flex: 1,
    minHeight: touch.standard,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 12,
  },
  familyPillActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  familyText: { ...typeScale.smallBold, color: colors.ink, textAlign: 'center' },
  familyTextActive: { color: '#FFFFFF' },
  raiseButton: {
    minHeight: touch.driverPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.emerald,
    borderRadius: radius.card,
  },
  raiseText: { ...typeScale.bodyBold, color: '#FFFFFF' },
  hint: { ...typeScale.tiny, color: colors.inkSecondary, textAlign: 'center' },
  radarSheet: { borderTopWidth: 3, borderTopColor: colors.amberBright },
  radarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  radarTitle: { ...typeScale.subtitle },
  radarMeta: { ...typeScale.tiny },
  radarBody: { ...typeScale.body, color: colors.ink },
  lockedSheet: { borderTopWidth: 3, borderTopColor: colors.emerald },
  lockedTitle: { ...typeScale.subtitle },
  lockedBody: { ...typeScale.body, color: colors.ink },
  lockedMeta: { ...typeScale.small, color: colors.inkSecondary },
  cancelRow: {
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelText: { ...typeScale.smallBold, color: colors.inkSecondary },
});
