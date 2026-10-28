import type { ReactNode } from 'react';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions, TextStyle } from 'react-native';

import { colors, radius, typeScale } from '../theme';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Right-side node on the label row (e.g. a badge). */
  labelRight?: ReactNode;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  accessibilityLabel?: string;
  /** Hide the label row (search fields, where the placeholder carries it). */
  labelHidden?: boolean;
  /** Larger, semibold input text (the phone number field). */
  large?: boolean;
}

/** Labelled 52px input (pre-trip only — trips themselves stay typing-free). */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  suffix,
  labelRight,
  keyboardType = 'default',
  editable = true,
  accessibilityLabel,
  labelHidden,
  large,
}: Props) {
  const [focused, setFocused] = useState(false);
  // Web only: suppress the browser's default black focus outline so the
  // field keeps the design's coral focus border on every platform.
  const noOutline =
    Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : undefined;
  return (
    <View style={styles.wrap}>
      {labelHidden ? null : (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {labelRight}
        </View>
      )}
      <View style={[styles.box, focused && styles.boxFocused]}>
        {prefix}
        <TextInput
          accessibilityLabel={accessibilityLabel ?? label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, large && styles.inputLarge, noOutline]}
        />
        {suffix}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { ...typeScale.labelMd, color: colors.ink },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.input,
    paddingHorizontal: 12,
  },
  boxFocused: { borderColor: colors.primary },
  input: { flex: 1, ...typeScale.body, color: colors.ink, paddingVertical: 0 },
  inputLarge: { ...typeScale.headlineSm },
});
