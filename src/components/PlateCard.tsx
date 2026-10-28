import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

import { colors, typeScale } from '../theme';
import { formatPlate } from '../lib/format';

/**
 * Government plate card (dark navy per the design): left "PAK / KPK"
 * column, center spaced plate number, right shield + "EXCISE".
 * `plate` is the full stored value, e.g. "KPK SWAT-4821" — the leading
 * "KPK " is stripped for the center number (it already sits on the left).
 */
export function PlateCard({ plate }: { plate: string }) {
  const number = formatPlate(plate.replace(/^KPK\s+/i, ''));
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.pak}>PAK</Text>
        <Text style={styles.kpk}>KPK</Text>
        <View style={styles.kpkUnderline} />
      </View>
      <Text style={styles.number}>[ {number} ]</Text>
      <View style={styles.right}>
        <ShieldCheck size={18} color="#16A34A" />
        <Text style={styles.excise}>EXCISE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  left: { alignItems: 'flex-start', gap: 0 },
  pak: { ...typeScale.labelSm, color: '#16A34A' },
  kpk: { ...typeScale.headlineSm, color: colors.white },
  kpkUnderline: { width: 28, height: 2, backgroundColor: '#16A34A', marginTop: 2 },
  number: { ...typeScale.headlineSm, color: colors.white, letterSpacing: 1 },
  right: { alignItems: 'center', gap: 2 },
  excise: { ...typeScale.labelSm, color: '#16A34A' },
});
