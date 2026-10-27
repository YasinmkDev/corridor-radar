import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radius, touch, typeScale } from '../theme';
import type { Stop } from '../types';

const SHORT_NAMES: Record<string, string> = {
  'Mingora General Stand': 'Mingora',
  'Kanju Chowk': 'Kanju',
  Dherai: 'Dherai',
  'Kabal Chowk': 'Kabal',
  Sirsinai: 'Sirsinai',
  'Matta Mughal Khel Stand': 'Matta',
  'Mingora / Fizagat': 'Fizagat',
  'Charbagh Chowk': 'Charbagh',
  'Khwazakhela Bypass': 'Khwazakhela',
  Fatehpur: 'Fatehpur',
  'Madyan Stand': 'Madyan',
  'Bahrain Bazaar': 'Bahrain',
};

export function shortStopName(name: string): string {
  return SHORT_NAMES[name] ?? name.split(' ')[0];
}

interface Props {
  stops: Stop[];
  selected: number;
  onSelect: (index: number) => void;
  dark: boolean;
}

export function StopPills({ stops, selected, onSelect, dark }: Props) {
  const hairline = dark ? colors.nightHairline : colors.hairline;
  const inactiveText = dark ? colors.nightSecondary : colors.inkSecondary;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {stops.map((stop, i) => {
        const active = i === selected;
        return (
          <Pressable
            key={stop.name}
            accessibilityRole="button"
            onPress={() => onSelect(i)}
            style={[
              styles.pill,
              { borderColor: hairline },
              active && styles.pillActive,
            ]}
          >
            <Text style={[styles.pillText, { color: active ? '#FFFFFF' : inactiveText }]}>
              {shortStopName(stop.name)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingRight: 4 },
  pill: {
    minHeight: touch.standard,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  pillActive: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  pillText: { ...typeScale.smallBold },
});
