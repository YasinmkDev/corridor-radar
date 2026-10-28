import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { colors, radius, typeScale } from '../theme';

interface Props {
  icon?: ReactNode;
  title: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
  /**
   * Top-right node: 'radio' renders the selection circle (check when
   * selected — driver vehicle grid); any other node is rendered as-is
   * (shift direction tiles pass ACTIVE/RETURN chips).
   */
  topRight?: 'radio' | ReactNode;
}

/**
 * Vertical grid tile: icon top-left, top-right selection node, title, sub.
 * Selected = apricot fill + 2px coral border.
 */
export function TileCard({ icon, title, sub, selected, onPress, topRight }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        {icon ? <View style={styles.tile}>{icon}</View> : null}
        {topRight === 'radio' ? (
          <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected ? <Check size={14} color={colors.white} /> : null}
          </View>
        ) : (
          topRight
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: 12,
    gap: 8,
  },
  selected: { backgroundColor: colors.apricot, borderWidth: 2, borderColor: colors.primary },
  pressed: { opacity: 0.65 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  tile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.micro,
  },
  radio: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    borderRadius: 12,
  },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  title: { ...typeScale.labelLg, color: colors.ink },
  sub: { ...typeScale.bodySm, color: colors.inkSecondary },
});
