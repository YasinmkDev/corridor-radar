/**
 * Demo-only local profile state. There is no backend: auth accepts any
 * valid PK number, OTP accepts any 4 digits, and KYC "verified" state is
 * local only. This store never touches the corridor engine
 * (useCorridorStore) — it only holds what the user entered in the
 * welcome / auth / setup flows plus a few local demo preferences.
 */
import { create } from 'zustand';

export type Role = 'passenger' | 'driver';
export type Language = 'en' | 'ps' | 'ur';
export type Seating = 'standard' | 'family';
export type Channel = 'whatsapp' | 'sms';

export interface Kyc {
  vehicleType: string;
  plate: string;
  adda: string;
  done: boolean;
}

interface ProfileState {
  role: Role;
  phone: string;
  channel: Channel;
  name: string;
  seating: Seating;
  language: Language;
  kyc: Kyc;
  authed: boolean;
  setupDone: boolean;
  /** Driver shift state: false = shift setup, true = live cockpit. */
  driverLive: boolean;
  whatsappAlerts: boolean;
  offlineCache: boolean;
  sosNumber: string;

  setRole: (role: Role) => void;
  setPhone: (phone: string) => void;
  setChannel: (channel: Channel) => void;
  setName: (name: string) => void;
  setSeating: (seating: Seating) => void;
  setLanguage: (language: Language) => void;
  setKyc: (patch: Partial<Kyc>) => void;
  setAuthed: (v: boolean) => void;
  setSetupDone: (v: boolean) => void;
  setDriverLive: (v: boolean) => void;
  setWhatsappAlerts: (v: boolean) => void;
  setOfflineCache: (v: boolean) => void;
  setSosNumber: (v: string) => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  role: 'passenger',
  phone: '',
  channel: 'whatsapp',
  name: '',
  seating: 'standard',
  language: 'en',
  kyc: {
    vehicleType: 'Toyota Fielder / Probox',
    plate: 'KPK SWAT-4821',
    adda: 'Mingora General Adda',
    done: false,
  },
  authed: false,
  setupDone: false,
  driverLive: false,
  whatsappAlerts: true,
  offlineCache: true,
  sosNumber: '0345-XXXXXXX',

  setRole: (role) => set({ role }),
  setPhone: (phone) => set({ phone }),
  setChannel: (channel) => set({ channel }),
  setName: (name) => set({ name }),
  setSeating: (seating) => set({ seating }),
  setLanguage: (language) => set({ language }),
  setKyc: (patch) => set((s) => ({ kyc: { ...s.kyc, ...patch } })),
  setAuthed: (authed) => set({ authed }),
  setSetupDone: (setupDone) => set({ setupDone }),
  setDriverLive: (driverLive) => set({ driverLive }),
  setWhatsappAlerts: (whatsappAlerts) => set({ whatsappAlerts }),
  setOfflineCache: (offlineCache) => set({ offlineCache }),
  setSosNumber: (sosNumber) => set({ sosNumber }),
}));
