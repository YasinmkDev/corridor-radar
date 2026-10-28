import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PersonStanding, Van } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Chip } from '../components/Chip';
import { RoleCard } from '../components/RoleCard';
import { SegmentedControl } from '../components/SegmentedControl';
import { TrustBar } from '../components/TrustBar';
import { useProfileStore, type Language, type Role } from '../store/useProfileStore';
import { colors, typeScale } from '../theme';

/** Screen 1 — Welcome / role selection, as designed. */
export function WelcomeScreen() {
  const router = useRouter();
  const language = useProfileStore((s) => s.language);
  const setLanguage = useProfileStore((s) => s.setLanguage);
  const setRole = useProfileStore((s) => s.setRole);
  const [role, setRoleLocal] = useState<Role>('passenger');

  const go = () => {
    setRole(role);
    router.push('/phone');
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Swat Raah</Text>
          <Chip label="Live Road & Seat Radar" variant="apricot" />
        </View>
        <View style={styles.langWrap}>
          <SegmentedControl<Language>
            accessibilityLabel="Language"
            compact
            options={[
              { value: 'en', label: 'EN' },
              { value: 'ps', label: 'پښتو' },
              { value: 'ur', label: 'اردو' },
            ]}
            value={language}
            onChange={setLanguage}
          />
        </View>
      </View>

      <View style={styles.questionWrap}>
        <Text style={styles.question}>
          How will you use <Text style={styles.questionAccent}>Swat Raah</Text>?
        </Text>
        <Text style={styles.questionSub}>
          Select your primary role. You can switch roles anytime from your profile settings.
        </Text>
      </View>

      <RoleCard
        icon={<PersonStanding size={28} color={role === 'passenger' ? colors.white : colors.primary} />}
        title="Sawari"
        sub="Passenger"
        chip="Daily Commuter"
        description="See live approaching cars on your road, check empty & family seats in real-time, and hold your ride before it reaches your stop."
        pills={[
          { label: 'Live Approaching Radar' },
          { label: 'Ladies/Family Row', family: true },
          { label: 'Fixed Local Fares' },
        ]}
        selected={role === 'passenger'}
        onPress={() => setRoleLocal('passenger')}
      />

      <RoleCard
        icon={<Van size={28} color={role === 'driver' ? colors.white : colors.primary} />}
        title="Ustad"
        sub="Commercial Driver"
        chip="Vehicle Owner"
        description="Broadcast empty seats with 1 tap, spot waiting passengers on the road ahead, and never turn back half-empty."
        pills={[
          { label: 'Road Ahead Radar' },
          { label: 'Seat Stepper Counter' },
          { label: 'Adda Verification' },
        ]}
        selected={role === 'driver'}
        onPress={() => setRoleLocal('driver')}
      />

      <TrustBar text="Verified Swat Valley Transit Corridor: Mingora • Bahrain • Kalam • Matta • Kabal" />

      <AppButton
        label={role === 'passenger' ? 'Continue as Sawari →' : 'Continue as Ustad →'}
        onPress={go}
      />

      <Text style={styles.footnote}>
        By continuing, you agree to local commuter safety &amp; passenger community guidelines.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerText: { gap: 2, flexShrink: 1 },
  title: { ...typeScale.headlineMd, color: colors.primaryDeep },
  langWrap: { width: 168 },
  questionWrap: { gap: 8 },
  question: { ...typeScale.headlineMd, color: colors.ink },
  questionAccent: { color: colors.primary },
  questionSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  footnote: { ...typeScale.bodySm, color: colors.muted, textAlign: 'center' },
});
