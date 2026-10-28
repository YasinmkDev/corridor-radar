import type { ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, typeScale } from '../theme';

interface Option<T extends string> {
  value: T;
  label: string;
  /** Optional leading icon (picker direction arrows). */
  icon?: ReactNode;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  /** Compact size for tight controls (welcome language pills). */
  compact?: boolean;
}

/** Pill segmented control: selected = coral fill, white text. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  compact,
}: Props<T>) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        // Tint lucide icons with the label color (white when selected).
        const iconNode =
          opt.icon && isValidElement(opt.icon)
            ? cloneElement(opt.icon, {
                color: selected ? colors.white : colors.ink,
              } as Partial<unknown>)
            : opt.icon;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="tab"
            accessibilityLabel={opt.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(opt.value)}
            style={[
              styles.option,
              compact && styles.optionCompact,
              selected && styles.optionSelected,
            ]}
          >
            {iconNode}
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
  },
  optionSelected: { backgroundColor: colors.primary },
  optionCompact: { minHeight: 36, paddingHorizontal: 4 },
  label: { ...typeScale.labelMd, color: colors.ink, textAlign: 'center' },
  labelSelected: { color: colors.white },
});
