import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, MapPin } from 'lucide-react-native';

import { colors, typeScale } from '../theme';
import { Chip } from './Chip';

export type StopState =
  | 'terminal'
  | 'passed'
  | 'prev'
  | 'selected'
  | 'next'
  | 'waiting'
  | 'terminus';

interface Props {
  name: string;
  state: StopState;
  /** Live meta line, e.g. "3 Approaching" / "6 Cars Waiting at Adda". */
  meta?: string;
  /** Design's "Hotspot" chip (Kabal Chowk when 2+ approaching). */
  hotspot?: boolean;
  /** Hide the timeline connector below the dot (last row). */
  last?: boolean;
  onPress: () => void;
}

const STATE_CHIP: Record<StopState, string> = {
  terminal: 'Terminal',
  passed: 'Passed',
  prev: '1 stop away',
  selected: 'Selected',
  next: 'Next stop',
  waiting: 'Waiting',
  terminus: 'Terminus',
};

/**
 * Picker stop row (design screen 6): timeline dot column + name + state
 * chip + live meta line, with a radio circle on the right. The vertical
 * connector links each dot to the next row's dot.
 */
export function StopRow({ name, state, meta, hotspot, last, onPress }: Props) {
  const selected = state === 'selected';
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={name}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.timeline}>
        <View style={[styles.dot, dotStyles[state]]}>
          {state === 'passed' ? <Check size={10} color={colors.muted} /> : null}
          {selected ? <MapPin size={12} color={colors.white} /> : null}
        </View>
        {last ? null : <View style={styles.connector} />}
      </View>
      <View style={styles.text}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          <Chip
            label={STATE_CHIP[state]}
            variant={state === 'prev' ? 'apricot' : state === 'selected' ? 'dark' : 'grey'}
            icon={selected ? <MapPin size={12} color={colors.white} /> : undefined}
          />
        </View>
        {meta || hotspot ? (
          <View style={styles.metaRow}>
            {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            {hotspot ? <Chip label="Hotspot" variant="amber" /> : null}
          </View>
        ) : null}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  pressed: { opacity: 0.65 },
  timeline: { alignItems: 'center', width: 20 },
  dot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: colors.cardBorder,
    minHeight: 12,
    // Extend 8px past the row bottom so the spine meets the next row's
    // dot through the next row's top padding (rows are adjacent).
    marginBottom: -8,
  },
  text: { flex: 1, gap: 4, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { ...typeScale.labelLg, color: colors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  meta: { ...typeScale.bodySm, color: colors.inkSecondary },
  radio: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    borderRadius: 12,
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
});

const dotStyles = StyleSheet.create({
  terminal: { borderColor: colors.muted },
  passed: { borderColor: colors.muted },
  prev: { borderColor: colors.primary, backgroundColor: colors.primary },
  selected: { borderColor: colors.primary, backgroundColor: colors.primary },
  next: { borderColor: colors.muted },
  waiting: { borderColor: colors.muted },
  terminus: { borderColor: colors.muted },
});
