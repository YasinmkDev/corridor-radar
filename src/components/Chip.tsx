import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typeScale } from '../theme';

export type ChipVariant =
  | 'apricot'
  | 'indigo'
  | 'green'
  | 'amber'
  | 'grey'
  | 'coral'
  | 'outline'
  | 'dark'
  | 'red';

interface Props {
  label: string;
  variant?: ChipVariant;
  icon?: ReactNode;
  /** Small status dot before the label (coral by default). */
  dot?: boolean;
  /** Compact size for tight contexts (e.g. the OTP portal chip). */
  small?: boolean;
}

/**
 * Small status chips. 28px tall, 12px horizontal padding, full pill.
 * Note: apricot chips use the design's deep accent (#A33900) for text
 * rather than bright coral — bright coral on apricot fails AA at 12px,
 * and the deep accent is the design's own palette.
 */
export function Chip({ label, variant = 'apricot', icon, dot, small }: Props) {
  return (
    <View style={[styles.base, styles[variant], small && styles.smallBase]}>
      {dot ? <View style={[styles.dot, dotStyles[variant]]} /> : null}
      {icon}
      <Text style={[labelStyles[variant], small && labelSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  smallBase: { paddingHorizontal: 10, paddingVertical: 5 },
  apricot: { backgroundColor: colors.apricot },
  indigo: { backgroundColor: colors.familyTint },
  green: { backgroundColor: colors.successTint },
  amber: { backgroundColor: colors.demandBg },
  grey: { backgroundColor: colors.surface },
  coral: { backgroundColor: colors.primary },
  outline: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dark: { backgroundColor: colors.ink },
  red: { backgroundColor: colors.errorTint },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

const dotStyles = StyleSheet.create({
  apricot: { backgroundColor: colors.primary },
  indigo: { backgroundColor: colors.family },
  green: { backgroundColor: colors.success },
  amber: { backgroundColor: colors.primaryDeep },
  grey: { backgroundColor: colors.muted },
  coral: { backgroundColor: colors.white },
  outline: { backgroundColor: colors.primary },
  dark: { backgroundColor: colors.white },
  red: { backgroundColor: colors.error },
});

const labelStyles = StyleSheet.create({
  apricot: { ...typeScale.labelMd, color: colors.primaryDeep },
  indigo: { ...typeScale.labelMd, color: colors.family },
  green: { ...typeScale.labelMd, color: colors.success },
  amber: { ...typeScale.labelMd, color: colors.ink },
  grey: { ...typeScale.labelMd, color: colors.inkSecondary },
  coral: { ...typeScale.labelMd, color: colors.white },
  outline: { ...typeScale.labelMd, color: colors.ink },
  dark: { ...typeScale.labelMd, color: colors.white },
  red: { ...typeScale.labelMd, color: colors.error },
});

const labelSmall = typeScale.labelSm;

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Pressable Chip for stop strips: selected = solid coral, unselected =
 * outline chip with a coral dot (the design's boarding-stop strip).
 */
export function SelectableChip({ label, selected, onPress }: SelectableChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [pressed && stylesPressed]}
    >
      <Chip label={label} variant={selected ? 'coral' : 'outline'} dot={!selected} />
    </Pressable>
  );
}

const stylesPressed = { opacity: 0.65 };
