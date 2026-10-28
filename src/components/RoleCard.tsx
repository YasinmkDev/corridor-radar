import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { colors, radius, shadows, typeScale } from '../theme';
import { Chip } from './Chip';

export interface RolePill {
  label: string;
  family?: boolean;
}

interface Props {
  icon: ReactNode;
  title: string;
  sub: string;
  chip: string;
  description: string;
  pills: RolePill[];
  selected: boolean;
  onPress: () => void;
}

/** Role selection card (welcome screen): icon tile + titles + feature pills. */
export function RoleCard({
  icon,
  title,
  sub,
  chip,
  description,
  pills,
  selected,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.tile, selected && styles.tileSelected]}>{icon}</View>
        <View style={styles.titles}>
          <Text style={styles.title}>
            {title} <Text style={styles.sub}>({sub})</Text>
          </Text>
          <Chip label={chip} variant="apricot" />
        </View>
        <View style={[styles.check, selected && styles.checkSelected]}>
          {selected ? <Check size={16} color={colors.white} /> : null}
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.pills}>
        {pills.map((pill) => (
          <Chip
            key={pill.label}
            label={pill.label}
            variant={pill.family ? 'indigo' : 'outline'}
            dot={!pill.family}
          />
        ))}
      </View>
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
  selected: { borderWidth: 2, borderColor: colors.primary },
  pressed: { opacity: 0.65 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tile: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 28,
  },
  tileSelected: { backgroundColor: colors.primary },
  titles: { flex: 1, gap: 6 },
  title: { ...typeScale.headlineSm, color: colors.ink },
  sub: { ...typeScale.bodySm, color: colors.inkSecondary },
  check: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    borderRadius: 14,
  },
  checkSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  description: { ...typeScale.bodySm, color: colors.inkSecondary },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
