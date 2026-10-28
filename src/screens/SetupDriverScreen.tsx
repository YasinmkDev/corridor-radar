import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BadgeCheck,
  Bus,
  Car,
  CarFront,
  CreditCard,
  Info,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field } from '../components/Field';
import { PlateCard } from '../components/PlateCard';
import { TileCard } from '../components/TileCard';
import { useCorridorStore } from '../store/useCorridorStore';
import { useProfileStore } from '../store/useProfileStore';
import { colors, typeScale } from '../theme';

const VEHICLE_TYPES = [
  {
    title: 'Toyota Fielder / Probox',
    sub: '4–6 Seats • Sedan/Wagon',
    icon: <CarFront size={22} color={colors.primary} />,
  },
  {
    title: 'Toyota Hiace Coach',
    sub: '14 Seats • Van',
    icon: <Bus size={22} color={colors.primary} />,
  },
  {
    title: 'Suzuki Bolan / Carry',
    sub: '7 Seats • Small carrier',
    icon: <Truck size={22} color={colors.primary} />,
  },
  {
    title: 'Kalam / Miandam 4×4',
    sub: '8–10 Seats • Rugged Jeep',
    icon: <Car size={22} color={colors.primary} />,
  },
];

/** Screen 4b — Driver KYC / vehicle verification (Step 3 of 3). Demo: saves locally only. */
export function SetupDriverScreen() {
  const router = useRouter();
  const kyc = useProfileStore((s) => s.kyc);
  const setKyc = useProfileStore((s) => s.setKyc);
  const setName = useProfileStore((s) => s.setName);
  const setSetupDone = useProfileStore((s) => s.setSetupDone);
  const setMode = useCorridorStore((s) => s.setMode);
  const setDriverLive = useProfileStore((s) => s.setDriverLive);

  const [name, setNameLocal] = useState('');
  const [cnic, setCnic] = useState('');
  const [vehicleType, setVehicleType] = useState(kyc.vehicleType);
  const [adda, setAdda] = useState(kyc.adda);
  const [helpNote, setHelpNote] = useState(false);

  return (
    <AppScreen scroll={false}>
      <ScrollView
        style={styles.top}
        contentContainerStyle={styles.topContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          onBack={() => router.back()}
          stepLabel="Ustad Verification (Driver Onboarding)"
          onHelp={() => setHelpNote((v) => !v)}
        />

        <Chip
          label="KPK Transport Authority Partner"
          variant="indigo"
          icon={<ShieldCheck size={14} color={colors.family} />}
        />
        <Text style={styles.headline}>Register your vehicle on Swat Raah</Text>
        <Text style={styles.sub}>
          Verified drivers receive higher passenger priority and Adda trust badge.
        </Text>
        {helpNote ? (
          <Text style={styles.help}>
            Enter the name and CNIC exactly as on your license. Your Adda confirms the vehicle
            record.
          </Text>
        ) : null}

        <Card>
          <View style={styles.cardHeader}>
            <User size={18} color={colors.primaryDeep} />
            <Text style={styles.cardTitle}>Driver Profile</Text>
            <Chip label="Step 1 of 3" variant="apricot" />
          </View>
          <Field
            label="Ustad Full Name"
            value={name}
            onChangeText={setNameLocal}
            placeholder="Your full name"
            prefix={<User size={18} color={colors.primary} />}
            suffix={<BadgeCheck size={18} color={colors.primary} />}
            accessibilityLabel="Ustad full name"
          />
          <Field
            label="CNIC / Driving License"
            value={cnic}
            onChangeText={setCnic}
            placeholder="XXXXX-XXXXXXX-X"
            keyboardType="numbers-and-punctuation"
            prefix={<CreditCard size={18} color={colors.primary} />}
            suffix={<BadgeCheck size={18} color={colors.success} />}
            accessibilityLabel="CNIC or driving license"
          />
        </Card>

        <Card>
          <View style={styles.cardHeader}>
            <CarFront size={18} color={colors.primaryDeep} />
            <Text style={styles.cardTitle}>Select Vehicle Type</Text>
            <Text style={styles.muted}>Tactile Grid</Text>
          </View>
          <View style={styles.grid}>
            {VEHICLE_TYPES.map((v) => (
              <View key={v.title} style={styles.gridCell}>
                <TileCard
                  icon={v.icon}
                  title={v.title}
                  sub={v.sub}
                  topRight="radio"
                  selected={vehicleType === v.title}
                  onPress={() => setVehicleType(v.title)}
                />
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.plateBlock}>
          <View style={styles.plateLabelRow}>
            <Text style={styles.fieldLabel}>Vehicle Registration Number:</Text>
            <Text style={styles.muted}>Govt Standard</Text>
          </View>
          <PlateCard plate={kyc.plate} />
          <View style={styles.noteRow}>
            <Info size={14} color={colors.inkSecondary} />
            <Text style={styles.note}>
              Matched against KPK Excise Department database records.
            </Text>
          </View>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <ShieldCheck size={18} color={colors.primaryDeep} />
            <Text style={styles.cardTitle}>Corridor &amp; Adda Affiliation</Text>
          </View>
          <Field
            label="Adda affiliation"
            value={adda}
            onChangeText={setAdda}
            placeholder="Mingora General Adda"
            accessibilityLabel="Adda affiliation"
          />
          <Text style={styles.note}>Matta Route #4</Text>
        </Card>

        <Card tone="apricot">
          <Text style={styles.trustText}>
            <Text style={styles.trustBold}>✓ Trust Benefit: </Text>
            Automatically grants you the Verified Adda Member badge on passenger radars.
          </Text>
        </Card>
      </ScrollView>

      <AppButton
        label="Complete Ustad Registration →"
        onPress={() => {
          setName(name.trim());
          setKyc({ vehicleType, plate: kyc.plate, adda, done: true });
          setMode('driver');
          setDriverLive(false);
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
  headline: { ...typeScale.display, color: colors.ink },
  sub: { ...typeScale.body, color: colors.inkSecondary },
  help: { ...typeScale.bodySm, color: colors.inkSecondary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  muted: { ...typeScale.labelMd, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCell: { width: '48%', flexGrow: 1 },
  plateBlock: { gap: 8 },
  plateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fieldLabel: { ...typeScale.labelMd, color: colors.ink },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  note: { ...typeScale.bodySm, color: colors.inkSecondary, flex: 1 },
  trustText: { ...typeScale.bodySm, color: colors.ink },
  trustBold: { color: colors.primaryDeep },
});
