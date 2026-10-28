import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Delete, Shield } from 'lucide-react-native';

import { colors, radius, typeScale } from '../theme';

interface Props {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}

const LETTERS: Record<string, string> = {
  '1': '---',
  '2': 'ABC',
  '3': 'DEF',
  '4': 'GHI',
  '5': 'JKL',
  '6': 'MNO',
  '7': 'PQRS',
  '8': 'TUV',
  '9': 'WXYZ',
  '0': '+',
};

/** Custom numeric keypad (1–9 with letters, shield key, 0, backspace). */
export function Keypad({ onDigit, onBackspace }: Props) {
  const key = (digit: string) => (
    <Pressable
      key={digit}
      accessibilityRole="button"
      accessibilityLabel={`Digit ${digit}`}
      onPress={() => onDigit(digit)}
      style={({ pressed }) => [styles.key, pressed && styles.pressed]}
    >
      <Text style={styles.digit}>{digit}</Text>
      {LETTERS[digit] ? <Text style={styles.letters}>{LETTERS[digit]}</Text> : null}
    </Pressable>
  );
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {key('1')}
        {key('2')}
        {key('3')}
      </View>
      <View style={styles.row}>
        {key('4')}
        {key('5')}
        {key('6')}
      </View>
      <View style={styles.row}>
        {key('7')}
        {key('8')}
        {key('9')}
      </View>
      <View style={styles.row}>
        <View style={styles.key}>
          <Shield size={22} color={colors.muted} />
        </View>
        {key('0')}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Backspace"
          onPress={onBackspace}
          style={({ pressed }) => [styles.key, pressed && styles.pressed]}
        >
          <Delete size={22} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  key: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.input,
  },
  pressed: { opacity: 0.65 },
  digit: { ...typeScale.headlineSm, color: colors.ink },
  letters: { ...typeScale.labelSm, color: colors.muted },
});
