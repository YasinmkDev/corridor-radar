import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CarFront,
  Download,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
} from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { AppScreen } from '../components/AppScreen';
import { AppSwitch } from '../components/AppSwitch';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field } from '../components/Field';
import { SegmentedControl } from '../components/SegmentedControl';
import { TopBar } from '../components/TopBar';
import { corridorById } from '../data/seed';
import { formatPhone } from '../lib/format';
import { selectMyStopIndex, useCorridorStore } from '../store/useCorridorStore';
import { useProfileStore, type Language } from '../store/useProfileStore';
import { colors, radius, typeScale } from '../theme';

/** Screen 12 — Account / trust profile + role switcher, as designed. */
export function AccountScreen() {
  const router = useRouter();
  const role = useProfileStore((s) => s.role);
  const name = useProfileStore((s) => s.name);
  const phone = useProfileStore((s) => s.phone);
  const language = useProfileStore((s) => s.language);
  const whatsappAlerts = useProfileStore((s) => s.whatsappAlerts);
  const offlineCache = useProfileStore((s) => s.offlineCache);
  const sosNumber = useProfileStore((s) => s.sosNumber);
  const setRole = useProfileStore((s) => s.setRole);
  const setLanguage = useProfileStore((s) => s.setLanguage);
  const setWhatsappAlerts = useProfileStore((s) => s.setWhatsappAlerts);
  const setOfflineCache = useProfileStore((s) => s.setOfflineCache);
  const setSosNumber = useProfileStore((s) => s.setSosNumber);
  const setMode = useCorridorStore((s) => s.setMode);
  const corridorId = useCorridorStore((s) => s.corridorId);
  const myStopIndex = useCorridorStore(selectMyStopIndex);

  const [editingSos, setEditingSos] = useState(false);
  const [sosDraft, setSosDraft] = useState(sosNumber);

  const displayName = name.trim() || 'Yasin Malak';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const corridor = corridorById(corridorId);
  const defaultStop = corridor.stops[myStopIndex].name;

  const switchRole = () => {
    const next = role === 'passenger' ? 'driver' : 'passenger';
    setRole(next);
    setMode(next);
    router.replace('/(tabs)/radar');
  };

  return (
    <AppScreen>
      <TopBar title="Account & Preferences" />

      <Card>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{displayName}</Text>
            <View style={styles.chipRow}>
              <Chip
                label="Verified"
                variant="apricot"
                icon={<ShieldCheck size={14} color={colors.primaryDeep} />}
              />
              <Chip label="WhatsApp Verified" variant="indigo" />
            </View>
          </View>
        </View>
        {phone ? <Text style={styles.phone}>🇵🇰 +92 {formatPhone(phone)}</Text> : null}
        <View style={styles.infoBox}>
          <Star size={16} color={colors.primary} />
          <Text style={styles.infoText}>4.9 Commuter Rating • 84 Safe Trips in Swat</Text>
        </View>
        <View style={styles.infoBox}>
          <MapPin size={16} color={colors.primary} />
          <Text style={styles.infoText} numberOfLines={1}>
            Default Stop: {defaultStop} ({corridor.from} ↔ {corridor.to} Route)
          </Text>
        </View>
      </Card>

      <Card>
        <View style={styles.prefHeader}>
          <Text style={styles.prefTitle}>Preferences &amp; Mountain Utility</Text>
          <Text style={styles.prefVersion}>Valley v2.4</Text>
        </View>

        <View style={styles.prefRow}>
          <View style={styles.prefTile}>
            <Globe size={20} color={colors.primary} />
          </View>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>Language</Text>
            <Text style={styles.prefSub}>Dialect &amp; Script</Text>
          </View>
        </View>
        <SegmentedControl<Language>
          accessibilityLabel="Language"
          options={[
            { value: 'en', label: 'English' },
            { value: 'ps', label: 'پښتو' },
            { value: 'ur', label: 'اردو' },
          ]}
          value={language}
          onChange={setLanguage}
        />

        <View style={styles.prefRow}>
          <View style={styles.prefTile}>
            <MessageCircle size={20} color={colors.primary} />
          </View>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>WhatsApp Seat Alerts</Text>
            <Text style={styles.prefSub}>Live Adda seat confirmations</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel="WhatsApp Seat Alerts"
            accessibilityState={{ checked: whatsappAlerts }}
            onPress={() => setWhatsappAlerts(!whatsappAlerts)}
          >
            <Chip label={whatsappAlerts ? '✓ Active' : 'Off'} variant={whatsappAlerts ? 'apricot' : 'grey'} />
          </Pressable>
        </View>

        <View style={styles.prefRow}>
          <View style={styles.prefTile}>
            <Download size={20} color={colors.primary} />
          </View>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>Offline Valley Route Cache</Text>
            <Text style={styles.prefSub}>Saves fares &amp; stops during mountain blackouts</Text>
          </View>
          <AppSwitch
            value={offlineCache}
            onChange={setOfflineCache}
            accessibilityLabel="Offline Valley Route Cache"
          />
        </View>

        <View style={styles.prefRow}>
          <View style={styles.prefTile}>
            <Phone size={20} color={colors.primary} />
          </View>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>Emergency SOS Contact</Text>
            <Text style={styles.sosSub}>{sosNumber} (KPK Rescue 1122 Linked)</Text>
          </View>
          <Pressable
            onPress={() => {
              setSosDraft(sosNumber);
              setEditingSos((v) => !v);
            }}
          >
            <Text style={styles.edit}>{editingSos ? 'Cancel' : 'Edit'}</Text>
          </Pressable>
        </View>
        {editingSos ? (
          <>
            <Field
              label="SOS number"
              value={sosDraft}
              onChangeText={setSosDraft}
              placeholder="0345-XXXXXXX"
              keyboardType="phone-pad"
            />
            <AppButton
              label="Save SOS number"
              variant="secondary"
              compact
              onPress={() => {
                setSosNumber(sosDraft.trim() || '0345-XXXXXXX');
                setEditingSos(false);
              }}
            />
          </>
        ) : null}
      </Card>

      <Card>
        <View style={styles.roleHeader}>
          <View style={styles.prefTile}>
            <CarFront size={20} color={colors.primary} />
          </View>
          <Text style={styles.roleTitle}>
            {role === 'passenger' ? 'Commercial Driver Today?' : 'Travelling as Ustad'}
          </Text>
          {role === 'passenger' ? <Chip label="USTAD" variant="coral" /> : null}
        </View>
        <Text style={styles.roleNote}>
          {role === 'passenger'
            ? 'Are you taking your car out on the corridor? Switch to Ustad mode to broadcast empty seats and earn fares.'
            : 'You are broadcasting trips. Switch to Sawari mode to find rides and raise your hand.'}
        </Text>
        <AppButton
          label={
            role === 'passenger' ? 'Switch to Ustad (Driver) Mode →' : 'Switch to Sawari Mode'
          }
          onPress={switchRole}
        />
        {role === 'passenger' ? (
          <Text style={styles.roleFootnote}>
            Requires verified KPK driving license and vehicle registration.
          </Text>
        ) : null}
      </Card>

      <Text style={styles.footer}>
        Swat Raah v2.4 • KPK Transport Authority Partner • Swat Adda Union
      </Text>
      <Text style={styles.footer}>
        Encrypted Transit Telemetry • Mingora Central Terminal Hub
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typeScale.headlineSm, color: colors.white },
  profileText: { flex: 1, gap: 6 },
  name: { ...typeScale.headlineSm, color: colors.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  phone: { ...typeScale.bodySm, color: colors.inkSecondary },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.micro,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: { ...typeScale.bodySm, color: colors.ink, flex: 1 },
  prefHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  prefTitle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  prefVersion: { ...typeScale.labelMd, color: colors.muted },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefTile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.micro,
  },
  prefText: { flex: 1, gap: 2 },
  prefLabel: { ...typeScale.labelLg, color: colors.ink },
  prefSub: { ...typeScale.bodySm, color: colors.inkSecondary },
  sosSub: { ...typeScale.bodySm, color: colors.family },
  edit: { ...typeScale.labelLg, color: colors.primaryDeep },
  roleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roleTitle: { ...typeScale.labelLg, color: colors.ink, flex: 1 },
  roleNote: { ...typeScale.bodySm, color: colors.inkSecondary },
  roleFootnote: { ...typeScale.bodySm, color: colors.muted },
  footer: { ...typeScale.bodySm, color: colors.muted, textAlign: 'center' },
});
