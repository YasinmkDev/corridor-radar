import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, User } from 'lucide-react-native';

import { tick } from '../lib/haptics';
import { colors, radius, touch, typeScale } from '../theme';
import type { Mode } from '../types';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
  dark: boolean;
}

export function ModeSwitcher({ mode, onChange, dark }: Props) {
  const inactiveText = dark ? colors.nightSecondary : colors.inkSecondary;
  return (
    <View style={[styles.wrap, dark && styles.wrapDark]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Passenger mode"
        onPress={() => { tick(); onChange('passenger'); }}
        style={({ pressed }) => [
          styles.button,
          mode === 'passenger' && styles.active,
          pressed && styles.pressed,
        ]}
      >
        <User size={20} color={mode === 'passenger' ? colors.white : inactiveText} />
        <Text
          style={[styles.label, { color: mode === 'passenger' ? colors.white : inactiveText }]}
        >
          Passenger Mode
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Driver cockpit"
        onPress={() => { tick(); onChange('driver'); }}
        style={({ pressed }) => [
          styles.button,
          mode === 'driver' && styles.active,
          pressed && styles.pressed,
        ]}
      >
        <Car size={20} color={mode === 'driver' ? colors.white : inactiveText} />
        <Text style={[styles.label, { color: mode === 'driver' ? colors.white : inactiveText }]}>
          Driver Cockpit
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.hairline,
    borderRadius: radius.pill,
    padding: 4,
  },
  wrapDark: { backgroundColor: colors.nightCard },
  button: {
    flex: 1,
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
  },
  active: { backgroundColor: colors.emeraldAction },
  label: { ...typeScale.smallBold },
  pressed: { opacity: 0.65 },
});
