import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

import { colors, radius, shadows, typeScale } from '../theme';

interface Props {
  text: string;
}

/** Verified corridor trust bar (shield + text), as on the welcome screen. */
export function TrustBar({ text }: Props) {
  return (
    <View style={styles.bar}>
      <ShieldCheck size={20} color={colors.primaryDeep} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.card,
    padding: 12,
    ...shadows.card,
  },
  text: { ...typeScale.bodySm, color: colors.ink, flex: 1 },
});
