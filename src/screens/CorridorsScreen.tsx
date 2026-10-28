import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

import { AppScreen } from '../components/AppScreen';
import { CorridorCard } from '../components/CorridorCard';
import { FARE_DIRECTORY } from '../data/faresDirectory';
import { useCorridorStore } from '../store/useCorridorStore';
import { colors, typeScale } from '../theme';

/**
 * Corridors tab: the two live corridors first (tap → that corridor's
 * radar), then the directory's further corridors as info-only rows.
 */
export function CorridorsScreen() {
  const router = useRouter();
  const setCorridor = useCorridorStore((s) => s.setCorridor);

  const live = FARE_DIRECTORY.filter((d) => d.liveId);
  const directoryOnly = FARE_DIRECTORY.filter((d) => !d.liveId);

  return (
    <AppScreen>
      <Text style={styles.headline}>Corridors</Text>
      <Text style={styles.sub}>
        Live radar covers Mingora–Matta and Mingora–Bahrain. Other corridors are directory info only.
      </Text>

      <Text style={styles.sectionTitle}>Live corridors</Text>
      {live.map((d) => (
        <CorridorCard
          key={d.title}
          corridor={d}
          onPress={() => {
            setCorridor(d.liveId!);
            router.push('/(tabs)/radar');
          }}
        />
      ))}

      <Text style={styles.sectionTitle}>Directory</Text>
      {directoryOnly.map((d) => (
        <CorridorCard key={d.title} corridor={d} />
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headline: { ...typeScale.headline, color: colors.ink },
  sub: { ...typeScale.body, color: colors.inkSecondary },
  sectionTitle: { ...typeScale.headlineSm, color: colors.ink, paddingTop: 8 },
});
