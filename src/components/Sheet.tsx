import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

import { colors, radius, shadows, typeScale } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  /** Small coral kicker above the title (spot sheet: "DRIVER ASSIST MODE"). */
  kicker?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Bottom sheet overlay: dimmed backdrop + white sheet with grabber.
 * Used for the stop/direction picker and the spot-sawari / hazard sheet.
 */
export function Sheet({ title, subtitle, kicker, onClose, children, footer }: Props) {
  return (
    <View style={styles.overlay}>
      <Pressable
        accessibilityLabel="Close sheet"
        onPress={onClose}
        style={styles.backdrop}
      />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <X size={20} color={colors.ink} />
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28, 25, 23, 0.4)',
  },
  backdrop: { flex: 1 },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 8,
    paddingBottom: 24,
    ...shadows.sheet,
  },
  grabber: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  titleWrap: { flex: 1, gap: 4 },
  kicker: { ...typeScale.labelMd, color: colors.primary },
  title: { ...typeScale.headlineMd, color: colors.ink },
  subtitle: { ...typeScale.bodySm, color: colors.inkSecondary },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: 20,
  },
  pressed: { opacity: 0.65 },
  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  footer: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
});
