import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Armchair,
  BadgeCheck,
  ChevronRight,
  Lock,
  Route,
  User,
  Users,
} from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { AppSwitch } from '../components/AppSwitch';
import { Card } from '../components/Card';
import { Chip, SelectableChip } from '../components/Chip';
import { Field } from '../components/Field';
import { OptionCard } from '../components/OptionCard';
import { corridorById } from '../data/seed';
import { shortStopName } from '../lib/stopNames';
import { useCorridorStore } from '../store/useCorridorStore';
import { useProfileStore, type Seating } from '../store/useProfileStore';
import type { CorridorId } from '../types';
import { colors, typeScale } from '../theme';

/** Design's exact boarding-stop strip labels for the Matta corridor. */
const MATTA_STRIP = ['Mingora Stand', 'Kanju', 'Dherai', 'Kabal Chowk', 'Sirsinai', 'Matta Stand'];

/** Screen 4a — Passenger commute setup (Step 3 of 3). */
export function SetupPassengerScreen() {
  const router = useRouter();
  const setName = useProfileStore((s) => s.setName);
  const setSeating = useProfileStore((s) => s.setSeating);
  const setSetupDone = useProfileStore((s) => s.setSetupDone);
  const setMode = useCorridorStore((s) => s.setMode);
  const setCorridor = useCorridorStore((s) => s.setCorridor);
  const setMyStop = useCorridorStore((s) => s.setMyStop);

  const [name, setNameLocal] = useState('');
  const [seating, setSeatingLocal] = useState<Seating>('standard');
  const [corridorId, setCorridorLocal] = useState<CorridorId>('mingora_matta');
  const [stopIndex, setStopIndex] = useState(3);
  const [proximity, setProximity] = useState(true);

  const corridor = corridorById(corridorId);
  const activeCount = corridorId === 'mingora_matta' ? 14 : 19;
  const stripLabels =
    corridorId === 'mingora_matta'
      ? MATTA_STRIP
      : corridor.stops.map((s) => shortStopName(s.name));

  const pickCorridor = (id: CorridorId) => {
    setCorridorLocal(id);
    // Default boarding stop: Kabal Chowk on Matta, Khwazakhela Bypass on Bahrain.
    setStopIndex(id === 'mingora_matta' ? 3 : 2);
  };
  const cycleCorridor = () =>
    pickCorridor(corridorId === 'mingora_matta' ? 'mingora_bahrain' : 'mingora_matta');

  return (
    <AppScreen scroll={false}>
      <ScrollView
        style={styles.top}
        contentContainerStyle={styles.topContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          onBack={() => router.back()}
          stepLabel="Step 3 of 3 (Sawari Setup)"
          rightNode={
            <Text style={styles.wordmark}>
              <Text style={styles.wordmarkDot}>●</Text> Swat Raah
            </Text>
          }
        />

        <Text style={styles.headline}>Set up your daily commute</Text>
        <Text style={styles.sub}>
          Tell us where you usually travel along the Swat river corridor.
        </Text>

        <Card>
          <View style={styles.cardHeader}>
            <User size={18} color={colors.primaryDeep} />
            <Text style={styles.cardTitle}>Passenger Profile</Text>
            <View style={styles.cardHeaderRight}>
              <Chip label="Sawari ID" variant="grey" />
            </View>
          </View>
          <Field
            label="YOUR FULL NAME"
            value={name}
            onChangeText={setNameLocal}
            placeholder="Your full name"
            prefix={<User size={18} color={colors.primary} />}
            suffix={<BadgeCheck size={18} color={colors.primary} />}
            accessibilityLabel="Your full name"
          />
          <Text style={styles.fieldLabel}>Seating Preference</Text>
          <OptionCard
            icon={
              <Armchair
                size={24}
                color={seating === 'standard' ? colors.white : colors.primary}
              />
            }
            title="Standard Seat"
            sub="Front or regular passenger rows"
            indicator="dot"
            tileTone={seating === 'standard' ? 'coral' : 'plain'}
            selected={seating === 'standard'}
            onPress={() => setSeatingLocal('standard')}
          />
          <OptionCard
            icon={
              <Users size={24} color={seating === 'family' ? colors.white : colors.family} />
            }
            title="Ladies / Family Section"
            sub="Reserved back-cabin buffer"
            badge="Priority"
            badgeVariant="indigo"
            indicator="dot"
            tileTone={seating === 'family' ? 'indigo' : 'plain'}
            selected={seating === 'family'}
            onPress={() => setSeatingLocal('family')}
          />
        </Card>

        <Card>
          <View style={styles.cardHeader}>
            <Route size={18} color={colors.primaryDeep} />
            <Text style={styles.cardTitle}>Corridor &amp; Boarding</Text>
            <View style={styles.cardHeaderRight}>
              <Text style={styles.express}>Express</Text>
            </View>
          </View>
          <Text style={styles.fieldLabel}>PRIMARY TRANSIT CORRIDOR</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${corridor.from} to ${corridor.to} corridor`}
            onPress={cycleCorridor}
            style={({ pressed }) => [styles.corridorPicker, pressed && styles.pressed]}
          >
            <Text style={styles.corridorTitle}>
              {corridor.from} ↔ {corridor.to} Corridor
            </Text>
            <View style={styles.corridorRow}>
              <Chip label={`${corridor.stops[corridor.stops.length - 1].km} km`} variant="apricot" />
              <View style={styles.activeRow}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>{activeCount} Active Vehicles</Text>
              </View>
              <View style={styles.chevronCircle}>
                <ChevronRight size={16} color={colors.muted} />
              </View>
            </View>
          </Pressable>
          <View style={styles.stripLabelRow}>
            <Text style={styles.fieldLabel}>Your Frequent Boarding Stop</Text>
            <Text style={styles.swipeNote}>Swipe stops →</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
          >
            {stripLabels.map((label, i) => (
              <SelectableChip
                key={label}
                label={label}
                selected={stopIndex === i}
                onPress={() => setStopIndex(i)}
              />
            ))}
          </ScrollView>
        </Card>

        <Card>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Proximity Alert</Text>
              <Text style={styles.toggleSub}>
                Alert me when empty car is 5 mins from {stripLabels[stopIndex]}
              </Text>
            </View>
            <AppSwitch
              value={proximity}
              onChange={setProximity}
              accessibilityLabel="Proximity alert"
            />
          </View>
          <View style={styles.noteRow}>
            <Lock size={14} color={colors.inkSecondary} />
            <Text style={styles.note}>Secure setup: One-tap live dispatch radar access</Text>
          </View>
        </Card>
      </ScrollView>

      <AppButton
        label="Launch Live Radar →"
        onPress={() => {
          setName(name.trim());
          setSeating(seating);
          setCorridor(corridorId);
          setMyStop(stopIndex);
          setMode('passenger');
          setSetupDone(true);
          router.replace('/(tabs)/radar');
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1 },
  topContent: { gap: 12, paddingBottom: 8 },
  wordmark: { ...typeScale.labelLg, color: colors.primaryDeep },
  wordmarkDot: { color: colors.primary },
  headline: { ...typeScale.display, color: colors.ink },
  sub: { ...typeScale.body, color: colors.inkSecondary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  cardHeaderRight: { alignItems: 'flex-end' },
  express: { ...typeScale.labelMd, color: colors.primaryDeep },
  fieldLabel: { ...typeScale.labelMd, color: colors.ink },
  corridorPicker: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  corridorTitle: { ...typeScale.labelLg, color: colors.ink },
  corridorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  activeText: { ...typeScale.bodySm, color: colors.inkSecondary },
  chevronCircle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
  },
  stripLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  swipeNote: { ...typeScale.labelMd, color: colors.primaryDeep },
  strip: { gap: 8, paddingVertical: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleText: { flex: 1, gap: 2 },
  toggleTitle: { ...typeScale.labelLg, color: colors.ink },
  toggleSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  note: { ...typeScale.bodySm, color: colors.inkSecondary, flex: 1 },
  pressed: { opacity: 0.65 },
});
