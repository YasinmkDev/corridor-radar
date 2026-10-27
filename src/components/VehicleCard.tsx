import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck, Star } from 'lucide-react-native';

import { colors, radius, typeScale } from '../theme';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  /** ETA in minutes to the passenger's stop, or null when moving away. */
  etaMinutes: number | null;
  dark: boolean;
}

export function VehicleCard({ vehicle, etaMinutes, dark }: Props) {
  const cardBg = dark ? colors.nightCard : colors.card;
  const hairline = dark ? colors.nightHairline : colors.hairline;
  const text = dark ? colors.nightText : colors.ink;
  const secondary = dark ? colors.nightSecondary : colors.inkSecondary;
  const seatsLeft = vehicle.availableSeats > 0;
  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: hairline }]}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.vehicleType, { color: text }]}>{vehicle.vehicleType}</Text>
          <Text style={[styles.driver, { color: secondary }]}>
            {vehicle.isMine ? 'You drive this' : `Ustad ${vehicle.driverName.replace(/^Ustad /, '')}`}
          </Text>
        </View>
        <View style={[styles.plateBox, { borderColor: hairline }]}>
          <Text style={[styles.plate, { color: text }]}>{vehicle.plateNumber}</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        {vehicle.verifiedAdda ? (
          <View style={[styles.badge, styles.verifiedBadge]}>
            <ShieldCheck size={14} color={colors.emerald} />
            <Text style={[styles.badgeText, { color: colors.emerald }]}>Verified Adda</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: dark ? colors.night : colors.canvas }]}>
            <Text style={[styles.badgeText, { color: secondary }]}>Unverified</Text>
          </View>
        )}
        <View style={styles.rating}>
          <Star size={14} color={colors.amber} />
          <Text style={[styles.badgeText, { color: text }]}>{vehicle.rating.toFixed(1)}</Text>
          <Text style={[styles.badgeText, { color: secondary }]}>· {vehicle.tripsCompleted} trips</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <View
          style={[
            styles.seatChip,
            { backgroundColor: seatsLeft ? colors.emeraldTint : colors.dangerTint },
          ]}
        >
          <Text
            style={[
              styles.seatText,
              { color: seatsLeft ? colors.emerald : colors.danger },
            ]}
          >
            {seatsLeft ? `${vehicle.availableSeats} Seats Left · Khali Seat` : 'Full'}
          </Text>
        </View>
        {vehicle.hasFamilySeat ? (
          <View style={[styles.seatChip, { backgroundColor: colors.indigoTint }]}>
            <Text style={[styles.seatText, { color: colors.indigo }]}>Family / Ladies Seat</Text>
          </View>
        ) : null}
        {etaMinutes !== null ? (
          <View style={[styles.seatChip, { backgroundColor: colors.amberTint }]}>
            <Text style={[styles.seatText, { color: colors.amber }]}>
              {etaMinutes === 0 ? 'Arriving now' : `~${etaMinutes} mins away`}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: 1, padding: 16, gap: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vehicleType: { ...typeScale.subtitle },
  driver: { ...typeScale.small, marginTop: 2 },
  plateBox: {
    borderWidth: 1.5,
    borderRadius: radius.chip,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  plate: { ...typeScale.plate },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.chip, paddingHorizontal: 8, paddingVertical: 4 },
  verifiedBadge: { backgroundColor: colors.emeraldTint },
  badgeText: { ...typeScale.tiny },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seatChip: { borderRadius: radius.chip, paddingHorizontal: 10, paddingVertical: 6 },
  seatText: { ...typeScale.smallBold },
});
