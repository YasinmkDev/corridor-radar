import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck, Search } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { CorridorCard } from '../components/CorridorCard';
import { Field } from '../components/Field';
import { SegmentedControl } from '../components/SegmentedControl';
import { TopBar } from '../components/TopBar';
import { FARE_DIRECTORY } from '../data/faresDirectory';
import { useCorridorStore } from '../store/useCorridorStore';
import { colors, typeScale } from '../theme';

type FareView = 'all' | 'matrix';

/** Screen 11 — Corridors + official fares directory, as designed. */
export function FaresScreen() {
  const router = useRouter();
  const setCorridor = useCorridorStore((s) => s.setCorridor);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<FareView>('all');
  const [reportNote, setReportNote] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FARE_DIRECTORY;
    return FARE_DIRECTORY.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.waypoints.some((w) => w.toLowerCase().includes(q)) ||
        d.fares.some(
          (f) =>
            f.vehicle.toLowerCase().includes(q) || f.range.toLowerCase().includes(q),
        ),
    );
  }, [query]);

  return (
    <AppScreen>
      <TopBar />

      <Text style={styles.title}>Corridors &amp; Fares</Text>
      <Text style={styles.subtitle}>District Swat Public Transport Registry</Text>
      <Chip
        label="KPK Govt Approved 2025"
        variant="apricot"
        icon={<BadgeCheck size={14} color={colors.primaryDeep} />}
      />

      <Field
        label="Search corridors"
        labelHidden
        value={query}
        onChangeText={setQuery}
        placeholder="Search route, stop, or fare rate…"
        prefix={<Search size={18} color={colors.muted} />}
        accessibilityLabel="Search route, stop, or fare rate"
      />

      <SegmentedControl<FareView>
        accessibilityLabel="Fare view"
        tone="light"
        options={[
          { value: 'all', label: 'All 4 Transit Corridors' },
          { value: 'matrix', label: 'Stop-to-Stop Fare Matrix' },
        ]}
        value={view}
        onChange={setView}
      />

      {filtered.length === 0 ? (
        <Text style={styles.empty}>No corridor matches that search.</Text>
      ) : (
        filtered.map((d) => (
          <CorridorCard
            key={d.title}
            corridor={d}
            ribbon={d.liveId === 'mingora_matta' ? 'High Traffic' : undefined}
            actionLabel={d.liveId ? 'View Live Radar' : undefined}
            onAction={
              d.liveId
                ? () => {
                    setCorridor(d.liveId!);
                    router.push('/(tabs)/radar');
                  }
                : undefined
            }
          />
        ))
      )}

      <Card>
        <Text style={styles.guaranteeTitle}>Anti-Overcharging Guarantee</Text>
        <Text style={styles.guaranteeText}>
          Official rates established by District Administration Swat. Report discrepancies via
          1-tap SOS. Drivers charging over ceiling rate face immediate permit suspension.
        </Text>
        {reportNote ? (
          <Text style={styles.reported}>Thank you — your report is noted.</Text>
        ) : (
          <AppButton
            label="Report Rate Violation"
            variant="secondary"
            onPress={() => setReportNote(true)}
          />
        )}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: { ...typeScale.display, color: colors.ink },
  subtitle: { ...typeScale.body, color: colors.inkSecondary },
  empty: { ...typeScale.body, color: colors.inkSecondary },
  guaranteeTitle: { ...typeScale.headlineSm, color: colors.ink },
  guaranteeText: { ...typeScale.body, color: colors.inkSecondary },
  reported: { ...typeScale.bodySm, color: colors.success },
});
