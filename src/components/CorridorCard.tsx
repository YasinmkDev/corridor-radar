import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Bus, Car, CarFront, Check, ChevronRight, ReceiptText, Radar } from 'lucide-react-native';

import type { DirectoryCorridor } from '../data/faresDirectory';
import { colors, radius, shadows, typeScale } from '../theme';
import { Chip } from './Chip';
import { AppButton } from './AppButton';

interface Props {
  corridor: DirectoryCorridor;
  /** Tapping a live corridor opens its radar; directory rows have no action. */
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  /** Coral ribbon, e.g. "HIGH TRAFFIC" on the Matta card. */
  ribbon?: string;
}

function vehicleIcon(vehicle: string) {
  if (/Hiace|Deluxe/i.test(vehicle)) return <Bus size={18} color={colors.inkSecondary} />;
  if (/Fielder/i.test(vehicle)) return <CarFront size={18} color={colors.inkSecondary} />;
  return <Car size={18} color={colors.inkSecondary} />;
}

/**
 * Corridor fare card as designed (screen 11): active chip + ribbon,
 * title, meta, bordered waypoints box, bordered "Official Fixed Rates"
 * box, note row, and a "View Live Radar" action for live corridors.
 */
export function CorridorCard({ corridor, onPress, actionLabel, onAction, ribbon }: Props) {
  const metaLine = [corridor.km > 0 ? `${corridor.km} km` : '', corridor.meta]
    .filter(Boolean)
    .join(' • ');
  const body = (
    <>
      {corridor.activeText || ribbon ? (
        <View style={styles.topRow}>
          {corridor.activeText ? (
            <Chip label={corridor.activeText} variant="green" dot />
          ) : (
            <View />
          )}
          {ribbon ? <Chip label={ribbon} variant="coral" /> : null}
        </View>
      ) : null}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{corridor.title}</Text>
        {metaLine ? <Text style={styles.meta}>{metaLine}</Text> : null}
      </View>
      <View style={styles.box}>
        <Text style={styles.boxLabel}>ROUTE WAYPOINTS</Text>
        <Text style={styles.waypoints}>{corridor.waypoints.join('  ➔  ')}</Text>
      </View>
      <View style={styles.box}>
        <View style={styles.faresHeader}>
          <ReceiptText size={16} color={colors.primaryDeep} />
          <Text style={styles.boxLabel}>Official Fixed Rates</Text>
        </View>
        <View style={styles.fares}>
          {corridor.fares.map((fare) => (
            <View key={fare.vehicle} style={styles.fareRow}>
              {vehicleIcon(fare.vehicle)}
              <Text style={styles.fareVehicle}>{fare.vehicle}</Text>
              <Text style={styles.fareRange}>
                {fare.range}
                {fare.perSeat ? <Text style={styles.perSeat}> / seat</Text> : null}
              </Text>
            </View>
          ))}
        </View>
      </View>
      {corridor.note ? (
        <View style={styles.noteRow}>
          {corridor.noteTone === 'demand' ? (
            <AlertTriangle size={16} color={colors.primaryDeep} />
          ) : (
            <Check size={16} color={colors.success} />
          )}
          <Text style={styles.note}>{corridor.note}</Text>
        </View>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          compact
          leftIcon={<Radar size={18} color={colors.white} />}
        />
      ) : null}
      {onPress && !actionLabel ? (
        <View style={styles.chevronRow}>
          <ChevronRight size={20} color={colors.muted} />
        </View>
      ) : null}
    </>
  );
  if (!onPress) {
    return <View style={styles.card}>{body}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={corridor.title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: 16,
    gap: 12,
    ...shadows.card,
  },
  pressed: { opacity: 0.65 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  titleWrap: { gap: 4 },
  title: { ...typeScale.headlineSm, color: colors.ink },
  meta: { ...typeScale.bodySm, color: colors.inkSecondary },
  box: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.micro,
    padding: 12,
    gap: 8,
  },
  boxLabel: { ...typeScale.labelMd, color: colors.ink },
  waypoints: { ...typeScale.bodySm, color: colors.primaryDeep },
  faresHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fares: { gap: 8 },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.micro,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fareVehicle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  fareRange: { ...typeScale.labelLg, color: colors.primaryDeep },
  perSeat: { ...typeScale.bodySm, color: colors.inkSecondary },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  note: { ...typeScale.bodySm, color: colors.inkSecondary, flex: 1 },
  chevronRow: { alignItems: 'flex-end' },
});
