import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { colors, radius, typeScale } from '../theme';
import { Chip } from './Chip';
import type { ChipVariant } from './Chip';

interface Props {
  icon?: ReactNode;
  title: string;
  sub?: string;
  badge?: string;
  badgeVariant?: ChipVariant;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  /**
   * Selected indicator: 'check' (coral circle with a white check — phone
   * channel cards, spot options) or 'dot' (coral ring with a filled dot —
   * the setup seating radios, the picker radios).
   */
  indicator?: 'check' | 'dot';
  /** Icon-tile tint: 'plain' (surface) | 'coral' | 'indigo'. */
  tileTone?: 'plain' | 'coral' | 'indigo';
  /**
   * Render the sub line on a tinted rounded strip (phone channel cards:
   * apricot for the recommended channel, grey for the slower one).
   */
  subStrip?: 'apricot' | 'grey';
}

/**
 * Radio row: icon tile + title + sub + optional badge + radio circle.
 * Selected = apricot fill + 2px coral border (the design's selection).
 */
export function OptionCard({
  icon,
  title,
  sub,
  badge,
  badgeVariant = 'apricot',
  selected,
  onPress,
  accessibilityLabel,
  indicator = 'check',
  tileTone = 'plain',
  subStrip,
}: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <View style={[styles.tile, tileStyles[tileTone]]}>{icon}</View> : null}
      <View style={styles.text}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? <Chip label={badge} variant={badgeVariant} /> : null}
        </View>
        {sub ? (
          subStrip ? (
            <View style={[styles.subStrip, subStripStyles[subStrip]]}>
              <Text style={styles.sub}>{sub}</Text>
            </View>
          ) : (
            <Text style={styles.sub}>{sub}</Text>
          )
        ) : null}
      </View>
      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
          selected && indicator === 'dot' && styles.radioDotSelected,
        ]}
      >
        {selected && indicator === 'check' ? (
          <Check size={14} color={colors.white} />
        ) : null}
        {selected && indicator === 'dot' ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: 16,
  },
  selected: { backgroundColor: colors.apricot, borderWidth: 2, borderColor: colors.primary },
  pressed: { opacity: 0.65 },
  tile: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.micro,
  },
  text: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title: { ...typeScale.labelLg, color: colors.ink },
  sub: { ...typeScale.bodySm, color: colors.inkSecondary },
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
  radioDotSelected: { backgroundColor: colors.card, borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  subStrip: {
    alignSelf: 'flex-start',
    borderRadius: radius.micro,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

const tileStyles = StyleSheet.create({
  plain: { backgroundColor: colors.surfaceLow },
  coral: { backgroundColor: colors.primary },
  indigo: { backgroundColor: colors.family },
});

const subStripStyles = StyleSheet.create({
  apricot: { backgroundColor: colors.apricot },
  grey: { backgroundColor: colors.surface },
});
