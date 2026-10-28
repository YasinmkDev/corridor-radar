import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
  accessibilityLabel: string;
}

/** Warm toggle switch: coral track when on, neutral when off. */
export function AppSwitch({ value, onChange, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.track, value && styles.trackOn]}
    >
      <View style={[styles.thumb, value && styles.thumbOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  trackOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  thumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  thumbOn: { alignSelf: 'flex-end' },
});
