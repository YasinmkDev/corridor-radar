import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, CircleHelp } from 'lucide-react-native';

import { colors, radius, typeScale } from '../theme';

interface Props {
  onBack?: () => void;
  /** e.g. "Step 1 of 3". */
  stepLabel?: string;
  helpLabel?: string;
  onHelp?: () => void;
  /** Right-side node, rendered instead of help/spacer (e.g. a wordmark). */
  rightNode?: ReactNode;
}

/** Top bar for the auth/setup flows: back + step pill + help. */
export function AppHeader({ onBack, stepLabel, helpLabel, onHelp, rightNode }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      {stepLabel ? (
        <View style={styles.stepPill}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText}>{stepLabel}</Text>
        </View>
      ) : (
        <View style={styles.spacer} />
      )}
      {rightNode ? (
        rightNode
      ) : onHelp ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={helpLabel || 'Help'}
          onPress={onHelp}
          style={({ pressed }) => [styles.help, pressed && styles.pressed]}
        >
          <CircleHelp size={18} color={colors.ink} />
          {helpLabel ? <Text style={styles.helpText}>{helpLabel}</Text> : null}
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  back: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
  },
  spacer: { width: 48 },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.apricot,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  stepText: { ...typeScale.labelMd, color: colors.ink },
  help: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  helpText: { ...typeScale.labelMd, color: colors.ink },
  pressed: { opacity: 0.65 },
});
