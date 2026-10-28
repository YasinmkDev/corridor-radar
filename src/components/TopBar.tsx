import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, typeScale } from '../theme';

interface Props {
  /** Wordmark text (default "Swat Raah"). Account uses its own title. */
  title?: string;
  /** Right-side node: pill, label, or nothing. */
  right?: ReactNode;
}

/**
 * Tab-screen top bar: left wordmark (primaryDeep bold) + optional right
 * node. Menu/tune/SOS icons are deliberately NOT rendered — the designs
 * give them no destination, and dead controls are worse than omission.
 */
export function TopBar({ title = 'Swat Raah', right }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.wordmark}>{title}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 48,
  },
  wordmark: { ...typeScale.headlineMd, color: colors.primaryDeep },
});
