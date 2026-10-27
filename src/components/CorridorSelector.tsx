import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';

import { CORRIDORS } from '../data/seed';
import { tick } from '../lib/haptics';
import { colors, radius, touch, typeScale } from '../theme';
import type { CorridorId, Direction } from '../types';

interface Props {
  corridorId: CorridorId;
  onCorridor: (id: CorridorId) => void;
  direction: Direction;
  onDirection: (d: Direction) => void;
  fromLabel: string;
  toLabel: string;
  dark: boolean;
}

export function CorridorSelector({
  corridorId,
  onCorridor,
  direction,
  onDirection,
  fromLabel,
  toLabel,
  dark,
}: Props) {
  const inactiveText = dark ? colors.nightSecondary : colors.inkSecondary;
  const pillBg = dark ? colors.nightCard : colors.card;
  const hairline = dark ? colors.nightHairline : colors.hairline;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {CORRIDORS.map((c) => {
          const active = c.id === corridorId;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`${c.label} corridor`}
              onPress={() => { tick(); onCorridor(c.id); }}
              style={({ pressed }) => [
                styles.pill,
                { backgroundColor: pillBg, borderColor: hairline },
                active && styles.pillActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.pillText, { color: active ? colors.white : inactiveText }]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Going to ${toLabel}`}
          onPress={() => { tick(); onDirection('UP'); }}
          style={({ pressed }) => [
            styles.dirButton,
            { backgroundColor: pillBg, borderColor: hairline },
            direction === 'UP' && styles.dirActive,
            pressed && styles.pressed,
          ]}
        >
          <ArrowUp size={18} color={direction === 'UP' ? colors.white : inactiveText} />
          <Text style={[styles.dirText, { color: direction === 'UP' ? colors.white : inactiveText }]}>
            To {toLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Going to ${fromLabel}`}
          onPress={() => { tick(); onDirection('DOWN'); }}
          style={({ pressed }) => [
            styles.dirButton,
            { backgroundColor: pillBg, borderColor: hairline },
            direction === 'DOWN' && styles.dirActive,
            pressed && styles.pressed,
          ]}
        >
          <ArrowDown size={18} color={direction === 'DOWN' ? colors.white : inactiveText} />
          <Text
            style={[styles.dirText, { color: direction === 'DOWN' ? colors.white : inactiveText }]}
          >
            To {fromLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    minHeight: touch.standard,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  pillActive: { backgroundColor: colors.emeraldAction, borderColor: colors.emeraldAction },
  pillText: { ...typeScale.smallBold, textAlign: 'center' },
  dirButton: {
    flex: 1,
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  dirActive: { backgroundColor: colors.emeraldAction, borderColor: colors.emeraldAction },
  dirText: { ...typeScale.smallBold },
  pressed: { opacity: 0.65 },
});
