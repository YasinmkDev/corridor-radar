import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typeScale } from '../theme';

interface Props {
  /** Segmented seat choice (radar) or stepper value (shift/cockpit). */
  value: number;
  onChange: (n: number) => void;
  /** 'segmented' renders 1 / 2 / 3+ pills; 'stepper' renders − value +. */
  variant?: 'segmented' | 'stepper';
  /** Shown under a stepper (e.g. "Total Capacity: 8"). */
  capacityLabel?: string;
  /**
   * Family toggle: rendered ONLY when onFamilyToggle is provided. Radar,
   * shift, and cockpit each render their own designed family row instead.
   */
  familyOn?: boolean;
  onFamilyToggle?: () => void;
  familyLabel?: string;
}

const SEGMENTS = [
  { value: 1, label: '1 Seat' },
  { value: 2, label: '2 Seats' },
  { value: 3, label: '3+ Seats' },
];

/** Seat choice + optional family toggle, shared by radar, shift, cockpit. */
export function SeatStepper({
  value,
  onChange,
  variant = 'segmented',
  capacityLabel,
  familyOn = false,
  onFamilyToggle,
  familyLabel = 'Ladies / Family Section',
}: Props) {
  return (
    <View style={styles.wrap}>
      {variant === 'segmented' ? (
        <View style={styles.segments}>
          {SEGMENTS.map((seg) => {
            const selected = value === seg.value;
            return (
              <Pressable
                key={seg.value}
                accessibilityRole="radio"
                accessibilityLabel={seg.label}
                accessibilityState={{ selected }}
                onPress={() => onChange(seg.value)}
                style={[styles.pill, selected && styles.pillSelected]}
              >
                <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>
                  {selected ? `✓ ${seg.label}` : seg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="One fewer seat"
            onPress={() => onChange(Math.max(0, value - 1))}
            style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
          >
            <Text style={styles.stepGlyph}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{`${value} SEATS`}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="One more seat"
            onPress={() => onChange(value + 1)}
            style={({ pressed }) => [styles.stepButton, styles.stepButtonPlus, pressed && styles.pressed]}
          >
            <Text style={[styles.stepGlyph, styles.stepGlyphPlus]}>+</Text>
          </Pressable>
        </View>
      )}
      {capacityLabel ? <Text style={styles.capacity}>{capacityLabel}</Text> : null}
      {onFamilyToggle ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel={familyLabel}
          accessibilityState={{ checked: familyOn }}
          onPress={onFamilyToggle}
          style={({ pressed }) => [styles.family, familyOn && styles.familyOn, pressed && styles.pressed]}
        >
          <Text style={[styles.familyLabel, familyOn && styles.familyLabelOn]}>
            {familyLabel}: {familyOn ? 'ACTIVE' : 'Off'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  segments: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
  },
  pillSelected: { backgroundColor: colors.apricot, borderWidth: 2, borderColor: colors.primary },
  pillLabel: { ...typeScale.labelMd, color: colors.ink, textAlign: 'center' },
  pillLabelSelected: { color: colors.primaryDeep },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.micro,
  },
  stepButtonPlus: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepGlyph: { ...typeScale.loud, color: colors.ink },
  stepGlyphPlus: { color: colors.white },
  stepValue: { ...typeScale.loud, color: colors.primaryDeep },
  capacity: { ...typeScale.bodySm, color: colors.inkSecondary, textAlign: 'center' },
  family: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
  },
  familyOn: { backgroundColor: colors.familyTint, borderColor: colors.family },
  familyLabel: { ...typeScale.labelLg, color: colors.ink, textAlign: 'center' },
  familyLabelOn: { color: colors.family },
  pressed: { opacity: 0.65 },
});
