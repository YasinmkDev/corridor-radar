export const colors = {
  canvas: '#F8FAFC',
  card: '#FFFFFF',
  night: '#0F172A',
  nightCard: '#1E293B',
  nightHairline: '#334155',
  ink: '#0F172A',
  inkSecondary: '#475569',
  inkMuted: '#94A3B8',
  nightText: '#F1F5F9',
  nightSecondary: '#CBD5E1',
  hairline: '#E2E8F0',
  emerald: '#059669',
  emeraldBright: '#10B981',
  emeraldTint: '#D1FAE5',
  amber: '#D97706',
  amberBright: '#F59E0B',
  amberTint: '#FEF3C7',
  indigo: '#4F46E5',
  indigoTint: '#E0E7FF',
  danger: '#DC2626',
  dangerTint: '#FEE2E2',
};

export const typeScale = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '800' as const },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  tiny: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  plate: { fontSize: 14, lineHeight: 20, fontWeight: '800' as const, letterSpacing: 1.5 },
};

/** Minimum touch targets: 56px everywhere, 64px for driver primary actions. */
export const touch = {
  standard: 56,
  driverPrimary: 64,
};

export const radius = {
  card: 16,
  pill: 999,
  chip: 10,
};
