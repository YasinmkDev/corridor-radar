import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, shadows, touch, typeScale } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'family' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** 64px driver primary instead of the standard 56px. */
  big?: boolean;
  /** Compact row action (40px) for in-list buttons like I'M COMING. */
  compact?: boolean;
  accessibilityLabel?: string;
}

/**
 * The app's one button. Three fills + ghost; full pill; min 56px.
 * Press feedback is instant opacity, never a timed animation.
 */
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  leftIcon,
  rightIcon,
  big = false,
  compact = false,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        big && styles.big,
        compact && styles.compact,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'family' && styles.family,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {leftIcon}
      <Text
        style={[
          styles.label,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'ghost' && styles.labelGhost,
          variant === 'danger' && styles.labelDanger,
        ]}
      >
        {label}
      </Text>
      {rightIcon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touch.standard,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
  },
  big: { minHeight: touch.driverPrimary },
  compact: { minHeight: 40, paddingHorizontal: 12 },
  primary: { backgroundColor: colors.primary, ...shadows.cta },
  secondary: {
    backgroundColor: colors.apricot,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  family: { backgroundColor: colors.family },
  ghost: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.error,
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.65 },
  label: { ...typeScale.labelLg, color: colors.white, textAlign: 'center' },
  labelSecondary: { color: colors.ink },
  labelGhost: { color: colors.primary },
  labelDanger: { color: colors.error },
});
