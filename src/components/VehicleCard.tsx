import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck, Users } from 'lucide-react-native';

import type { Vehicle, VehicleType } from '../types';
import { colors, typeScale } from '../theme';
import { formatPlate } from '../lib/format';
import { Chip } from './Chip';

interface Props {
  vehicle: Vehicle;
  /** Minutes to the passenger's stop (0 = here now). */
  etaMinutes: number;
  farePerSeat: number;
  /** Adda name for the verified line (live corridors start at Mingora). */
  addaName?: string;
}

/** Design's display name: the seed's "Hiace Coach" is a Toyota Hiace. */
function displayType(type: VehicleType): string {
  return type === 'Hiace Coach' ? 'Toyota Hiace Coach' : type;
}

/**
 * Vehicle card as designed (screen 5): type + ETA chip + fare on row 1,
 * driver + dark plate chip on row 2, verified-adda line on row 3, seat
 * and family/standard chips on row 4. Distance and stage live on the
 * timeline node above the card, not inside it.
 */
export function VehicleCard({ vehicle, etaMinutes, farePerSeat, addaName = 'Mingora' }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row1}>
        <Text style={styles.type}>{displayType(vehicle.vehicleType)}</Text>
        <Chip label={etaMinutes === 0 ? 'Here now' : `${etaMinutes} mins away`} variant="apricot" />
        <View style={styles.fare}>
          <Text style={styles.fareAmount}>Rs. {farePerSeat}</Text>
          <Text style={styles.fareUnit}>per seat</Text>
        </View>
      </View>
      <View style={styles.row2}>
        <Text style={styles.driver}>{vehicle.driverName}</Text>
        <View style={styles.plate}>
          <Text style={styles.plateText}>{formatPlate(vehicle.plateNumber)}</Text>
        </View>
      </View>
      {vehicle.verifiedAdda ? (
        <View style={styles.verified}>
          <ShieldCheck size={14} color={colors.success} />
          <Text style={styles.verifiedText}>Verified {addaName} Adda Member</Text>
        </View>
      ) : null}
      <View style={styles.chips}>
        <Chip
          label={vehicle.availableSeats === 0 ? 'Full' : `${vehicle.availableSeats} Seats Empty`}
          variant="green"
          dot={vehicle.availableSeats > 0}
        />
        {vehicle.hasFamilySeat ? (
          <Chip label="Family/Ladies Seat" variant="indigo" />
        ) : (
          <Chip
            label="Standard Cabin"
            variant="grey"
            icon={<Users size={12} color={colors.inkSecondary} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  row1: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  type: { ...typeScale.headlineSm, color: colors.ink, flex: 1 },
  fare: { alignItems: 'flex-end' },
  fareAmount: { ...typeScale.headlineSm, color: colors.primaryDeep },
  fareUnit: { ...typeScale.labelSm, color: colors.muted },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  driver: { ...typeScale.labelLg, color: colors.ink },
  plate: {
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  plateText: { ...typeScale.labelMd, color: colors.white, letterSpacing: 0.5 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { ...typeScale.labelMd, color: colors.success },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
