import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typeScale } from '../theme';

interface Props {
  value: string;
  length?: number;
}

/** OTP boxes: filled digit, coral dot in the active box, faint mark when empty. */
export function OtpBoxes({ value, length = 4 }: Props) {
  const boxes = Array.from({ length }, (_, i) => i);
  return (
    <View style={styles.row}>
      {boxes.map((i) => {
        const digit = value[i];
        const active = i === value.length;
        return (
          <View key={i} style={[styles.box, active && styles.boxActive]}>
            {digit ? (
              <Text style={styles.digit}>{digit}</Text>
            ) : active ? (
              <View style={styles.cursor} />
            ) : (
              <View style={styles.emptyMark} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  box: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.input,
  },
  boxActive: { borderWidth: 2, borderColor: colors.primary },
  digit: { ...typeScale.headline, color: colors.ink },
  cursor: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  emptyMark: { width: 8, height: 8, borderRadius: 2, backgroundColor: colors.surface },
});
