import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, User } from 'lucide-react-native';

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
        onPress={() => onChange('passenger')}
        style={[
          styles.button,
          mode === 'passenger' && styles.active,
        ]}
      >
        <User size={20} color={mode === 'passenger' ? '#FFFFFF' : inactiveText} />
        <Text style={[styles.label, { color: mode === 'passenger' ? '#FFFFFF' : inactiveText }]}>
          Passenger Mode
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange('driver')}
        style={[styles.button, mode === 'driver' && styles.active]}
      >
        <Car size={20} color={mode === 'driver' ? '#FFFFFF' : inactiveText} />
        <Text style={[styles.label, { color: mode === 'driver' ? '#FFFFFF' : inactiveText }]}>
          Driver Cockpit
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
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
  active: { backgroundColor: colors.emerald },
  label: { ...typeScale.smallBold },
});
