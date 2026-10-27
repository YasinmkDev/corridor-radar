import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';

import { CORRIDORS } from '../data/seed';
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
              onPress={() => onCorridor(c.id)}
              style={[
                styles.pill,
                { backgroundColor: pillBg, borderColor: hairline },
                active && styles.pillActive,
              ]}
            >
              <Text style={[styles.pillText, { color: active ? '#FFFFFF' : inactiveText }]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onDirection('UP')}
          style={[
            styles.dirButton,
            { backgroundColor: pillBg, borderColor: hairline },
            direction === 'UP' && styles.dirActive,
          ]}
        >
          <ArrowUp size={18} color={direction === 'UP' ? '#FFFFFF' : inactiveText} />
          <Text style={[styles.dirText, { color: direction === 'UP' ? '#FFFFFF' : inactiveText }]}>
            To {toLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onDirection('DOWN')}
          style={[
            styles.dirButton,
            { backgroundColor: pillBg, borderColor: hairline },
            direction === 'DOWN' && styles.dirActive,
          ]}
        >
          <ArrowDown size={18} color={direction === 'DOWN' ? '#FFFFFF' : inactiveText} />
          <Text
            style={[styles.dirText, { color: direction === 'DOWN' ? '#FFFFFF' : inactiveText }]}
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
  pillActive: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  pillText: { ...typeScale.smallBold, textAlign: 'center' },
  dirButton: {
    flex: 1,
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  dirActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  dirText: { ...typeScale.smallBold },
});
