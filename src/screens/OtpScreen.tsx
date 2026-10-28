import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Lock, RefreshCw, Shield } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { Chip } from '../components/Chip';
import { Keypad } from '../components/Keypad';
import { OtpBoxes } from '../components/OtpBoxes';
import { useProfileStore } from '../store/useProfileStore';
import { formatPhone } from '../lib/format';
import { colors, typeScale } from '../theme';

const RESEND_SECONDS = 24;

/** Screen 3 — OTP verification (Step 2 of 3). Any 4 digits proceed (demo). */
export function OtpScreen() {
  const router = useRouter();
  const phone = useProfileStore((s) => s.phone);
  const channel = useProfileStore((s) => s.channel);
  const role = useProfileStore((s) => s.role);
  const setAuthed = useProfileStore((s) => s.setAuthed);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [helpNote, setHelpNote] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <AppScreen scroll={false}>
      <ScrollView
        style={styles.top}
        contentContainerStyle={styles.topContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          onBack={() => router.back()}
          stepLabel="Step 2 of 3"
          helpLabel="Need Help?"
          onHelp={() => setHelpNote((v) => !v)}
        />

        <Chip
          label="SWAT EXPRESS PASSENGER PORTAL"
          variant="outline"
          icon={<Shield size={14} color={colors.primaryDeep} />}
          small
        />
        <Text style={styles.headline}>Verify your number</Text>
        <Text style={styles.sent}>
          Enter the 4-digit code sent via {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to
          +92 {formatPhone(phone)}
          <Text style={styles.edit} onPress={() => router.back()}>
            {'  '}[ Edit Number ]
          </Text>
        </Text>
        {helpNote ? (
          <Text style={styles.help}>
            If the code does not arrive, check your{' '}
            {channel === 'whatsapp' ? 'WhatsApp' : 'SMS inbox'} and try resending.
          </Text>
        ) : null}

        <OtpBoxes value={code} />

        <View style={styles.detectBar}>
          <Text style={styles.detectText}>Auto-detecting SMS &amp; WhatsApp…</Text>
          <RefreshCw size={16} color={colors.primaryDeep} />
        </View>

        <View style={styles.resendRow}>
          <Text style={styles.resendLeft}>Didn&apos;t get code?</Text>
          {seconds > 0 ? (
            <View style={styles.resendRight}>
              <Clock size={14} color={colors.primary} />
              <Text style={styles.resend}>
                Resend in {mm}:{ss}
              </Text>
            </View>
          ) : (
            <Pressable onPress={() => setSeconds(RESEND_SECONDS)}>
              <Text style={styles.resendAction}>Resend code</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Keypad
          onDigit={(d) => setCode((c) => (c.length < 4 ? c + d : c))}
          onBackspace={() => setCode((c) => c.slice(0, -1))}
        />
        <AppButton
          label="Verify & Continue →"
          disabled={code.length < 4}
          onPress={() => {
            setAuthed(true);
            router.push(role === 'driver' ? '/setup-driver' : '/setup-passenger');
          }}
        />
        <View style={styles.footnoteRow}>
          <Lock size={14} color={colors.muted} />
          <Text style={styles.footnote}>End-to-End Encrypted Transit Verification</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1 },
  topContent: { gap: 12, paddingBottom: 8 },
  headline: { ...typeScale.headlineMd, color: colors.ink },
  sent: { ...typeScale.bodySm, color: colors.inkSecondary },
  edit: { ...typeScale.labelLg, color: colors.primaryDeep },
  help: { ...typeScale.bodySm, color: colors.inkSecondary },
  detectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.apricot,
    borderRadius: 8,
    padding: 12,
  },
  detectText: { ...typeScale.bodySm, color: colors.inkSecondary, flex: 1 },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  resendLeft: { ...typeScale.bodySm, color: colors.inkSecondary },
  resendRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resend: { ...typeScale.labelMd, color: colors.primary },
  resendAction: { ...typeScale.labelLg, color: colors.primaryDeep },
  bottom: { gap: 12 },
  footnoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footnote: { ...typeScale.bodySm, color: colors.muted, textAlign: 'center' },
});
