import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BadgeCheck,
  ChevronDown,
  Lock,
  MessageCircle,
  MessageSquare,
  Shield,
  Smartphone,
  X,
} from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { Field } from '../components/Field';
import { OptionCard } from '../components/OptionCard';
import { useProfileStore, type Channel } from '../store/useProfileStore';
import { colors, radius, typeScale } from '../theme';

/** Display grouping for the phone field: 3-3-4, as in the design's sample. */
function formatField(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/** Screen 2 — Phone authentication (Step 1 of 3). Starts empty; the design's number is a sample only. */
export function PhoneScreen() {
  const router = useRouter();
  const setPhone = useProfileStore((s) => s.setPhone);
  const setChannel = useProfileStore((s) => s.setChannel);
  const [digits, setDigits] = useState('');
  const [channel, setChannelLocal] = useState<Channel>('whatsapp');
  const [error, setError] = useState('');

  const submit = () => {
    const clean = digits.replace(/\D/g, '');
    if (clean.length !== 10 || !clean.startsWith('3')) {
      setError('Enter a valid 10-digit mobile number starting with 3.');
      return;
    }
    setError('');
    setPhone(clean);
    setChannel(channel);
    router.push('/otp');
  };

  return (
    <AppScreen>
      <AppHeader onBack={() => router.back()} stepLabel="Step 1 of 3" />

      <View style={styles.iconTile}>
        <Smartphone size={28} color={colors.primary} />
        <View style={styles.iconBadge}>
          <BadgeCheck size={18} color={colors.success} />
        </View>
      </View>

      <Text style={styles.headline}>Enter your mobile number</Text>
      <Text style={styles.sub}>
        We&apos;ll send a 4-digit verification code to confirm your account and lock rides.
      </Text>

      <Field
        label="Mobile Number"
        value={formatField(digits)}
        onChangeText={(t) => setDigits(t.replace(/\D/g, '').slice(0, 10))}
        placeholder="345 503 6900"
        keyboardType="phone-pad"
        large
        prefix={
          <View style={styles.prefixChip}>
            <Text style={styles.prefixText}>PK +92</Text>
            <ChevronDown size={14} color={colors.ink} />
          </View>
        }
        suffix={
          digits ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear number"
              onPress={() => setDigits('')}
              style={styles.clear}
            >
              <X size={16} color={colors.muted} />
            </Pressable>
          ) : undefined
        }
        labelRight={
          <View style={styles.verifiedOnly}>
            <Shield size={14} color={colors.primaryDeep} />
            <Text style={styles.verifiedOnlyText}>Verified Only</Text>
          </View>
        }
        accessibilityLabel="Mobile number without country code"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.note}>Standard carrier validation applied for Swat Division</Text>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Preferred Delivery Channel</Text>
        <Text style={styles.sectionRight}>KPK Valley Mesh</Text>
      </View>
      <OptionCard
        icon={<MessageCircle size={24} color={colors.primary} />}
        title="Send code via WhatsApp"
        sub="● Recommended • Instant in Swat Valley"
        subStrip="apricot"
        selected={channel === 'whatsapp'}
        onPress={() => setChannelLocal('whatsapp')}
      />
      <OptionCard
        icon={<MessageSquare size={24} color={colors.primary} />}
        title="Send via SMS"
        sub="May take up to 1 min"
        subStrip="grey"
        selected={channel === 'sms'}
        onPress={() => setChannelLocal('sms')}
      />

      <AppButton label="Send 4-Digit Code →" onPress={submit} />

      <View style={styles.footnoteRow}>
        <Lock size={14} color={colors.muted} />
        <Text style={styles.footnote}>
          100% private. Your number is only shared with verified drivers when you lock a ride.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  iconTile: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.input,
  },
  iconBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: colors.card,
    borderRadius: 10,
  },
  headline: { ...typeScale.headlineMd, color: colors.ink },
  sub: { ...typeScale.body, color: colors.inkSecondary },
  prefixChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.micro,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  prefixText: { ...typeScale.labelMd, color: colors.ink },
  clear: { padding: 4 },
  verifiedOnly: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedOnlyText: { ...typeScale.labelMd, color: colors.primaryDeep },
  error: { ...typeScale.bodySm, color: colors.error },
  note: { ...typeScale.bodySm, color: colors.inkSecondary },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 8,
  },
  sectionLabel: { ...typeScale.labelLg, color: colors.ink },
  sectionRight: { ...typeScale.labelMd, color: colors.primaryDeep },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 6,
  },
  footnote: { ...typeScale.bodySm, color: colors.muted, textAlign: 'center', flex: 1 },
});
