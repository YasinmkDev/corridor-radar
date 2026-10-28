import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '../theme';

interface Props {
  children: ReactNode;
  /** 'low' = warm low container; 'success' = soft green wash; 'apricot' = tinted. */
  tone?: 'plain' | 'low' | 'success' | 'apricot' | 'family';
}

/** Plain info panel: white card, peach border, soft warm shadow. */
export function Card({ children, tone = 'plain' }: Props) {
  return (
    <View
      style={[
        styles.card,
        tone === 'low' && styles.low,
        tone === 'success' && styles.success,
        tone === 'apricot' && styles.apricot,
        tone === 'family' && styles.family,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: 16,
    gap: 8,
    ...shadows.card,
  },
  low: { backgroundColor: colors.surfaceLow },
  success: { backgroundColor: colors.successTint },
  apricot: { backgroundColor: colors.apricot },
  family: { backgroundColor: colors.familyTint },
});
